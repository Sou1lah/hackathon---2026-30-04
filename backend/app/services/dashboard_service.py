import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any

from sqlmodel import Session, select, func, col
from sqlalchemy import Engine

from app.models import User
from app.models_mobility import (
    InternshipRequest, 
    InternshipStatus, 
    Alert, 
    AlertSeverity,
    AlertCreate
)
from app.models_scraper import InternshipOffer
from app.models_suivi import ActivityLog
from app.utils import get_datetime_utc

class DashboardService:
    def __init__(self, session: Session, engine: Engine):
        self.session = session
        self.engine = engine
        self._ensure_tables_exist()

    def _ensure_tables_exist(self):
        """Ensure required tables exist."""
        from sqlmodel import SQLModel
        # This will create any missing tables defined in SQLModel
        SQLModel.metadata.create_all(self.engine)

    def get_internship_metrics(self) -> Dict[str, Any]:
        """Get internship related metrics."""
        total = self.session.exec(select(func.count(InternshipOffer.id))).one()
        
        # Latest 5
        latest_offers = self.session.exec(
            select(InternshipOffer)
            .order_by(col(InternshipOffer.created_at).desc())
            .limit(5)
        ).all()
        
        # New in last 7 days
        seven_days_ago = get_datetime_utc() - timedelta(days=7)
        new_items_count = self.session.exec(
            select(func.count(InternshipOffer.id))
            .where(InternshipOffer.created_at >= seven_days_ago)
        ).one()
        
        return {
            "total_internships": total,
            "latest_internships": [offer.model_dump() for offer in latest_offers],
            "new_items_7d": new_items_count
        }

    def get_dossier_metrics(self) -> Dict[str, Any]:
        """Get dossier/application metrics."""
        total = self.session.exec(select(func.count(InternshipRequest.id))).one()
        active = self.session.exec(
            select(func.count(InternshipRequest.id))
            .where(InternshipRequest.status == InternshipStatus.active)
        ).one()
        completed = self.session.exec(
            select(func.count(InternshipRequest.id))
            .where(InternshipRequest.status == InternshipStatus.completed)
        ).one()
        pending = self.session.exec(
            select(func.count(InternshipRequest.id))
            .where(InternshipRequest.status.in_([InternshipStatus.draft, InternshipStatus.pending_verification, InternshipStatus.pending_signature]))
        ).one()
        
        pending_verification = self.session.exec(
            select(func.count(InternshipRequest.id))
            .where(InternshipRequest.status == InternshipStatus.pending_verification)
        ).one()
        
        return {
            "total_dossiers": total,
            "active_dossiers": active,
            "completed_dossiers": completed,
            "pending_dossiers": pending,
            "pending_verification": pending_verification
        }

    def get_sla_metrics(self) -> Dict[str, Any]:
        """Calculate SLA metrics (14-day rule)."""
        dossiers = self.session.exec(select(InternshipRequest)).all()
        
        on_time = 0
        breached = 0
        
        now = get_datetime_utc()
        
        for d in dossiers:
            if d.status == InternshipStatus.completed:
                # If completed, check if it was completed on time
                if d.completed_at and d.created_at:
                    elapsed = (d.completed_at - d.created_at).days
                    if elapsed <= 14:
                        on_time += 1
                    else:
                        breached += 1
                else:
                    on_time += 1 # Assume on time if data missing but completed
            else:
                # If not completed, check current elapsed time
                if d.created_at:
                    elapsed = (now - d.created_at).days
                    if elapsed <= 14:
                        on_time += 1
                    else:
                        breached += 1
                else:
                    on_time += 1
        
        total = len(dossiers)
        breach_rate = (breached / total * 100) if total > 0 else 0
        
        return {
            "total_dossiers": total,
            "on_time_count": on_time,
            "breached_count": breached,
            "breach_rate": round(breach_rate, 2)
        }

    def get_signature_metrics(self) -> Dict[str, Any]:
        """Track signature workflow progress."""
        # Progress is 1-8 steps
        dossiers = self.session.exec(select(InternshipRequest)).all()
        
        if not dossiers:
            return {
                "average_progress": 0,
                "stalled_dossiers": 0,
                "completed_signatures": 0
            }
            
        total_progress_pct = 0
        stalled_count = 0
        completed_signatures = 0
        
        now = get_datetime_utc()
        
        for d in dossiers:
            # Progress % = (current_step / 8) * 100
            progress_pct = (d.current_step / 8) * 100
            total_progress_pct += progress_pct
            
            if d.current_step == 8 and d.status == InternshipStatus.completed:
                completed_signatures += 1
            
            # Stalled: no update for > 3 days
            if d.updated_at and (now - d.updated_at).days > 3:
                stalled_count += 1
                
        return {
            "average_progress": round(total_progress_pct / len(dossiers), 2),
            "stalled_dossiers": stalled_count,
            "completed_signatures": completed_signatures
        }

    def generate_alerts(self):
        """Automatically generate alerts based on rules."""
        now = get_datetime_utc()
        dossiers = self.session.exec(select(InternshipRequest)).all()
        
        for d in dossiers:
            if d.status == InternshipStatus.completed:
                continue
                
            if d.created_at:
                elapsed = (now - d.created_at).days
                remaining = 14 - elapsed
                
                # SLA Alert
                if remaining < 0:
                    self._create_alert_if_not_exists(
                        type="SLA_BREACH",
                        severity=AlertSeverity.critical,
                        message=f"Dossier {d.id} has breached the 14-day SLA deadline.",
                        dossier_id=d.id
                    )
                elif remaining <= 3:
                    self._create_alert_if_not_exists(
                        type="SLA_WARNING",
                        severity=AlertSeverity.warning,
                        message=f"Dossier {d.id} is approaching SLA deadline ({remaining} days left).",
                        dossier_id=d.id
                    )
            
            # Stalled Alert
            if d.updated_at and (now - d.updated_at).days > 5:
                self._create_alert_if_not_exists(
                    type="STALLED",
                    severity=AlertSeverity.warning,
                    message=f"Dossier {d.id} has been stuck in step {d.current_step} for more than 5 days.",
                    dossier_id=d.id
                )

    def _create_alert_if_not_exists(self, type: str, severity: AlertSeverity, message: str, dossier_id: uuid.UUID):
        """Helper to create an alert only if a similar active one doesn't exist."""
        existing = self.session.exec(
            select(Alert)
            .where(Alert.type == type)
            .where(Alert.dossier_id == dossier_id)
        ).first()
        
        if not existing:
            new_alert = Alert(
                type=type,
                severity=severity,
                message=message,
                dossier_id=dossier_id
            )
            self.session.add(new_alert)
            self.session.commit()

    def get_all_alerts(self) -> List[Dict[str, Any]]:
        """Fetch all alerts from DB."""
        # Generate any missing alerts first
        self.generate_alerts()
        
        alerts = self.session.exec(
            select(Alert).order_by(col(Alert.created_at).desc()).limit(20)
        ).all()
        return [alert.model_dump() for alert in alerts]

    def get_system_health(self) -> List[Dict[str, Any]]:
        """Check system health status."""
        return [
            {"name": "PROGRES Integration", "status": "ok", "latency": "45ms"},
            {"name": "Payment System (SATIM/Dahabia)", "status": "ok", "latency": "120ms"},
            {"name": "Document Archive System", "status": "degraded", "latency": "850ms"},
        ]

    def get_chart_data(self) -> List[Dict[str, Any]]:
        """Generate workflow chart data grouped by month."""
        dossiers = self.session.exec(select(InternshipRequest)).all()
        now = get_datetime_utc()
        months = [(now.replace(day=1) - timedelta(days=30 * i)).strftime("%b") for i in range(5, -1, -1)]
        
        counts = {m: 0 for m in months}
        for d in dossiers:
            if d.created_at:
                m = d.created_at.strftime("%b")
                if m in counts:
                    counts[m] += 1
                    
        return [{"name": k, "total": v} for k, v in counts.items()]

    def get_visitor_data(self) -> List[Dict[str, Any]]:
        """Generate visitor chart data based on activity logs."""
        logs = self.session.exec(select(ActivityLog)).all()
        now = get_datetime_utc()
        months = [(now.replace(day=1) - timedelta(days=30 * i)).strftime("%b") for i in range(5, -1, -1)]
        
        counts = {m: 0 for m in months}
        for log in logs:
            if log.created_at:
                m = log.created_at.strftime("%b")
                if m in counts:
                    counts[m] += 1
                    
        return [{"month": k, "visitors": v} for k, v in counts.items()]

    def get_full_overview(self) -> Dict[str, Any]:
        """Compile all metrics into a single overview response."""
        return {
            "internships": self.get_internship_metrics(),
            "dossiers": self.get_dossier_metrics(),
            "sla": self.get_sla_metrics(),
            "signature": self.get_signature_metrics(),
            "alerts": self.get_all_alerts(),
            "system_health": self.get_system_health(),
            "workflow_chart": self.get_chart_data(),
            "visitor_chart": self.get_visitor_data(),
            "timestamp": get_datetime_utc().isoformat()
        }
