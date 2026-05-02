import uuid
from datetime import datetime, timezone
from typing import Any

from sqlmodel import Session, col, func, select
from sqlalchemy.orm import selectinload

from app.models_mobility import (
    ActivityLogEntry,
    ActivityLogEntryCreate,
    ApprovalLevel,
    Convention,
    ConventionCreate,
    ConventionUpdate,
    DashboardStats,
    InternshipRequest,
    InternshipRequestCreate,
    InternshipRequestUpdate,
    InternshipStatus,
    InternshipReport,
    InternshipReportCreate,
    InternshipReportUpdate,
    ReportStatus,
    TutorEvaluation,
    TutorEvaluationCreate,
    Alert,
    AlertSeverity,
    MobilityFile,
    MobilityFileCreate,
    MobilityFileUpdate,
    MobilityType,
)


# ---------- InternshipRequest ----------

def create_internship_request(
    *, session: Session, request_in: InternshipRequestCreate, owner_id: uuid.UUID
) -> InternshipRequest:
    db_obj = InternshipRequest.model_validate(
        request_in, update={"owner_id": owner_id}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_internship_requests(
    *, session: Session, owner_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> tuple[list[InternshipRequest], int]:
    count_statement = (
        select(func.count())
        .select_from(InternshipRequest)
        .where(InternshipRequest.owner_id == owner_id)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(InternshipRequest)
        .where(InternshipRequest.owner_id == owner_id)
        .order_by(col(InternshipRequest.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    items = session.exec(statement).all()
    return list(items), count


def get_internship_request(
    *, session: Session, request_id: uuid.UUID
) -> InternshipRequest | None:
    return session.get(InternshipRequest, request_id)


def update_internship_request(
    *,
    session: Session,
    db_request: InternshipRequest,
    request_in: InternshipRequestUpdate,
) -> InternshipRequest:
    update_dict = request_in.model_dump(exclude_unset=True)
    db_request.sqlmodel_update(update_dict)
    db_request.updated_at = datetime.now(timezone.utc)
    session.add(db_request)
    session.commit()
    session.refresh(db_request)
    return db_request


def delete_internship_request(
    *, session: Session, db_request: InternshipRequest
) -> None:
    session.delete(db_request)
    session.commit()


# ---------- Convention ----------

def create_convention(
    *, session: Session, convention_in: ConventionCreate, owner_id: uuid.UUID
) -> Convention:
    db_obj = Convention.model_validate(
        convention_in, update={"owner_id": owner_id}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_conventions(
    *, session: Session, owner_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> tuple[list[Convention], int]:
    count_statement = (
        select(func.count())
        .select_from(Convention)
        .where(Convention.owner_id == owner_id)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(Convention)
        .where(Convention.owner_id == owner_id)
        .order_by(col(Convention.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    items = session.exec(statement).all()
    return list(items), count


def get_convention(
    *, session: Session, convention_id: uuid.UUID
) -> Convention | None:
    return session.get(Convention, convention_id)


def update_convention(
    *, session: Session, db_convention: Convention, convention_in: ConventionUpdate
) -> Convention:
    update_dict = convention_in.model_dump(exclude_unset=True)
    db_convention.sqlmodel_update(update_dict)
    db_convention.updated_at = datetime.now(timezone.utc)
    session.add(db_convention)
    session.commit()
    session.refresh(db_convention)
    return db_convention


def advance_signature(
    *, session: Session, db_convention: Convention
) -> Convention:
    if db_convention.signature_step < 8:
        db_convention.signature_step += 1
    if db_convention.signature_step == 8:
        db_convention.status = "completed"
    db_convention.updated_at = datetime.now(timezone.utc)
    session.add(db_convention)
    session.commit()
    session.refresh(db_convention)
    return db_convention


def delete_convention(*, session: Session, db_convention: Convention) -> None:
    session.delete(db_convention)
    session.commit()




def get_conventions_for_admin(
    *, session: Session, approval_level: ApprovalLevel | None = None, skip: int = 0, limit: int = 100
) -> tuple[list[Convention], int]:
    statement = select(Convention)
    count_statement = select(func.count()).select_from(Convention)
    
    if approval_level:
        statement = statement.where(Convention.approval_level == approval_level)
        count_statement = count_statement.where(Convention.approval_level == approval_level)
        
    count = session.exec(count_statement).one()
    
    statement = (
        statement
        .options(selectinload(Convention.owner), selectinload(Convention.internship_request))
        .order_by(col(Convention.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    items = session.exec(statement).all()
    return list(items), count


def approve_convention(
    *, session: Session, db_convention: Convention, admin_id: uuid.UUID
) -> Convention:
    # Logic: Force fully approve for the demo to enable immediate tracking
    db_convention.approval_level = ApprovalLevel.N3
    db_convention.status = "completed"
    db_convention.signature_step = 8  # Completed
    db_convention.admin_status = "approved_final"
    db_convention.updated_at = datetime.now(timezone.utc)
    
    # Activate the internship request
    req = session.get(InternshipRequest, db_convention.internship_request_id)
    if req:
        req.status = InternshipStatus.active
        req.updated_at = datetime.now(timezone.utc)
        session.add(req)
        
        # Send Notification (Alert)
        alert = Alert(
            type="Internship Approved",
            severity=AlertSeverity.info,
            message="Your internship application has been fully approved! You can now access your logbook and track your progress.",
            dossier_id=req.id
        )
        session.add(alert)
    
    # Audit log
    log = ActivityLogEntry(
        date=datetime.now(timezone.utc).date(),
        content=f"Convention officially approved and internship activated by admin {admin_id}.",
        hours=0,
        internship_request_id=db_convention.internship_request_id,
        owner_id=db_convention.owner_id
    )
    session.add(log)
    session.add(db_convention)
    session.commit()
    session.refresh(db_convention)
    return db_convention


def reject_convention(
    *, session: Session, db_convention: Convention, admin_id: uuid.UUID, reason: str = ""
) -> Convention:
    db_convention.status = "rejected"
    db_convention.admin_status = "rejected"
    db_convention.updated_at = datetime.now(timezone.utc)
    
    # Audit log
    log = ActivityLogEntry(
        date=datetime.now(timezone.utc).date(),
        content=f"Convention rejected by admin {admin_id}. Reason: {reason}",
        hours=0,
        internship_request_id=db_convention.internship_request_id,
        owner_id=db_convention.owner_id
    )
    session.add(log)
    session.add(db_convention)
    session.commit()
    session.refresh(db_convention)
    return db_convention


def forward_convention(
    *, session: Session, db_convention: Convention, admin_id: uuid.UUID, next_level: ApprovalLevel
) -> Convention:
    db_convention.approval_level = next_level
    db_convention.admin_status = f"forwarded_to_{next_level}"
    db_convention.updated_at = datetime.now(timezone.utc)
    
    # Audit log
    log = ActivityLogEntry(
        date=datetime.now(timezone.utc).date(),
        content=f"Convention forwarded by admin {admin_id} to level {next_level}",
        hours=0,
        internship_request_id=db_convention.internship_request_id,
        owner_id=db_convention.owner_id
    )
    session.add(log)
    session.add(db_convention)
    session.commit()
    session.refresh(db_convention)
    return db_convention


# ---------- MobilityFile ----------

def create_mobility_file(
    *, session: Session, file_in: MobilityFileCreate, owner_id: uuid.UUID
) -> MobilityFile:
    db_obj = MobilityFile.model_validate(file_in, update={"owner_id": owner_id})
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_mobility_files(
    *,
    session: Session,
    owner_id: uuid.UUID,
    mobility_type: MobilityType | None = None,
    skip: int = 0,
    limit: int = 100,
) -> tuple[list[MobilityFile], int]:
    base = select(MobilityFile).where(MobilityFile.owner_id == owner_id)
    count_base = (
        select(func.count())
        .select_from(MobilityFile)
        .where(MobilityFile.owner_id == owner_id)
    )
    if mobility_type:
        base = base.where(MobilityFile.mobility_type == mobility_type)
        count_base = count_base.where(MobilityFile.mobility_type == mobility_type)

    count = session.exec(count_base).one()
    statement = (
        base.order_by(col(MobilityFile.created_at).desc()).offset(skip).limit(limit)
    )
    items = session.exec(statement).all()
    return list(items), count


def get_mobility_file(
    *, session: Session, file_id: uuid.UUID
) -> MobilityFile | None:
    return session.get(MobilityFile, file_id)


def update_mobility_file(
    *, session: Session, db_file: MobilityFile, file_in: MobilityFileUpdate
) -> MobilityFile:
    update_dict = file_in.model_dump(exclude_unset=True)
    db_file.sqlmodel_update(update_dict)
    db_file.updated_at = datetime.now(timezone.utc)
    session.add(db_file)
    session.commit()
    session.refresh(db_file)
    return db_file


def delete_mobility_file(*, session: Session, db_file: MobilityFile) -> None:
    session.delete(db_file)
    session.commit()


def get_mobility_files_all(
    *,
    session: Session,
    mobility_type: MobilityType | None = None,
    skip: int = 0,
    limit: int = 100,
) -> tuple[list[MobilityFile], int]:
    """Return all mobility files (admin view — no owner filter)."""
    base = select(MobilityFile)
    count_base = select(func.count()).select_from(MobilityFile)
    if mobility_type:
        base = base.where(MobilityFile.mobility_type == mobility_type)
        count_base = count_base.where(MobilityFile.mobility_type == mobility_type)

    count = session.exec(count_base).one()
    statement = (
        base.order_by(col(MobilityFile.created_at).desc()).offset(skip).limit(limit)
    )
    items = session.exec(statement).all()
    return list(items), count


# ---------- ActivityLogEntry ----------

def create_activity_log_entry(
    *, session: Session, entry_in: ActivityLogEntryCreate, owner_id: uuid.UUID
) -> ActivityLogEntry:
    db_obj = ActivityLogEntry.model_validate(
        entry_in, update={"owner_id": owner_id}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_activity_log_entries(
    *,
    session: Session,
    internship_request_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
) -> tuple[list[ActivityLogEntry], int]:
    count_statement = (
        select(func.count())
        .select_from(ActivityLogEntry)
        .where(ActivityLogEntry.internship_request_id == internship_request_id)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(ActivityLogEntry)
        .where(ActivityLogEntry.internship_request_id == internship_request_id)
        .order_by(col(ActivityLogEntry.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    items = session.exec(statement).all()
    return list(items), count


# ---------- InternshipReport ----------

def create_internship_report(
    *, session: Session, report_in: InternshipReportCreate, owner_id: uuid.UUID
) -> InternshipReport:
    db_obj = InternshipReport.model_validate(
        report_in, update={"owner_id": owner_id}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_internship_reports(
    *,
    session: Session,
    internship_request_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
) -> tuple[list[InternshipReport], int]:
    count_statement = (
        select(func.count())
        .select_from(InternshipReport)
        .where(InternshipReport.internship_request_id == internship_request_id)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(InternshipReport)
        .where(InternshipReport.internship_request_id == internship_request_id)
        .order_by(col(InternshipReport.submitted_at).desc())
        .offset(skip)
        .limit(limit)
    )
    items = session.exec(statement).all()
    return list(items), count


def update_internship_report(
    *, session: Session, db_report: InternshipReport, report_in: InternshipReportUpdate
) -> InternshipReport:
    update_dict = report_in.model_dump(exclude_unset=True)
    db_report.sqlmodel_update(update_dict)
    if report_in.status:
        db_report.reviewed_at = datetime.now(timezone.utc)
    session.add(db_report)
    session.commit()
    session.refresh(db_report)
    return db_report


# ---------- TutorEvaluation ----------

def create_tutor_evaluation(
    *, session: Session, evaluation_in: TutorEvaluationCreate, owner_id: uuid.UUID
) -> TutorEvaluation:
    # Delete existing evaluation if any
    existing = session.exec(
        select(TutorEvaluation).where(
            TutorEvaluation.internship_request_id == evaluation_in.internship_request_id
        )
    ).first()
    if existing:
        session.delete(existing)
    
    db_obj = TutorEvaluation.model_validate(
        evaluation_in, update={"owner_id": owner_id}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_tutor_evaluation(
    *, session: Session, internship_request_id: uuid.UUID
) -> TutorEvaluation | None:
    return session.exec(
        select(TutorEvaluation).where(
            TutorEvaluation.internship_request_id == internship_request_id
        )
    ).first()


# ---------- Summary Helper ----------

def get_internship_summary_data(
    *, session: Session, internship_request_id: uuid.UUID
) -> dict[str, Any]:
    internship = session.get(InternshipRequest, internship_request_id)
    if not internship:
        return {}
    
    # Calculate total hours
    total_hours = session.exec(
        select(func.sum(ActivityLogEntry.hours))
        .where(ActivityLogEntry.internship_request_id == internship_request_id)
    ).one() or 0
    
    # Get last 3 entries
    recent_logs = session.exec(
        select(ActivityLogEntry)
        .where(ActivityLogEntry.internship_request_id == internship_request_id)
        .order_by(col(ActivityLogEntry.date).desc())
        .limit(3)
    ).all()
    
    # Get reports status
    reports = session.exec(
        select(InternshipReport)
        .where(InternshipReport.internship_request_id == internship_request_id)
        .order_by(col(InternshipReport.submitted_at).desc())
    ).all()
    
    # Get evaluation
    evaluation = get_tutor_evaluation(session=session, internship_request_id=internship_request_id)
    
    # Alerts (simple logic for now)
    alerts = []
    if total_hours < 50:
        alerts.append({
            "type": "warning",
            "message": "Volume horaire faible pour cette periode."
        })
    
    # SLA Tracking (14 days)
    days_active = (datetime.now(timezone.utc) - internship.created_at).days if internship.created_at else 0
    if days_active > 14 and internship.status != InternshipStatus.completed:
        alerts.append({
            "type": "critical",
            "message": f"Retard detecte: Le dossier est en cours depuis {days_active} jours (SLA: 14j)."
        })
    
    return {
        "id": internship.id,
        "status": internship.status,
        "progress": internship.progress,
        "current_step": internship.current_step,
        "total_hours": total_hours,
        "recent_logs": recent_logs,
        "reports": reports,
        "evaluation": evaluation,
        "alerts": alerts,
        "start_date": internship.start_date,
        "end_date": internship.end_date,
        "created_at": internship.created_at,
        "days_active": days_active,
        "mission_title": internship.mission_title,
        "company_name": internship.company_name,
        "supervisor_name": internship.supervisor_name,
    }


# ---------- Dashboard Stats ----------

def get_dashboard_stats(*, session: Session) -> DashboardStats:
    active = session.exec(
        select(func.count())
        .select_from(InternshipRequest)
        .where(InternshipRequest.status == InternshipStatus.active)
    ).one()
    pending = session.exec(
        select(func.count())
        .select_from(InternshipRequest)
        .where(
            InternshipRequest.status.in_(  # type: ignore[union-attr]
                [InternshipStatus.pending_verification, InternshipStatus.pending_signature]
            )
        )
    ).one()
    now = datetime.now(timezone.utc)
    first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    validated = session.exec(
        select(func.count())
        .select_from(InternshipRequest)
        .where(InternshipRequest.status == InternshipStatus.completed)
        .where(InternshipRequest.updated_at >= first_of_month)
    ).one()
    blocked = session.exec(
        select(func.count())
        .select_from(InternshipRequest)
        .where(InternshipRequest.status == InternshipStatus.blocked)
    ).one()

    return DashboardStats(
        active_internships=active,
        pending_requests=pending,
        validated_this_month=validated,
        critical_alerts=blocked,
    )
