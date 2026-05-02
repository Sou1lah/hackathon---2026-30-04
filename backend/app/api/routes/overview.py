from typing import List, Dict, Any
import uuid
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.api.deps import SessionDep, CurrentUser
from app.core.db import engine
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/overview", tags=["overview"])

class InternshipSummary(BaseModel):
    total_internships: int
    latest_internships: List[Dict[str, Any]]
    new_items_7d: int

class DossierSummary(BaseModel):
    total_dossiers: int
    active_dossiers: int
    completed_dossiers: int
    pending_dossiers: int

class SLASummary(BaseModel):
    total_dossiers: int
    on_time_count: int
    breached_count: int
    breach_rate: float

class SignatureSummary(BaseModel):
    average_progress: float
    stalled_dossiers: int
    completed_signatures: int

class SystemHealthItem(BaseModel):
    name: str
    status: str
    latency: str

class AlertItem(BaseModel):
    id: uuid.UUID
    type: str
    severity: str
    message: str
    dossier_id: uuid.UUID | None
    created_at: Any

class DashboardOverviewResponse(BaseModel):
    internships: InternshipSummary
    dossiers: DossierSummary
    sla: SLASummary
    signature: SignatureSummary
    alerts: List[AlertItem]
    system_health: List[SystemHealthItem]
    workflow_chart: List[Dict[str, Any]]
    visitor_chart: List[Dict[str, Any]]
    timestamp: str

@router.get("/", response_model=DashboardOverviewResponse)
def get_overview_data(session: SessionDep, current_user: CurrentUser):
    """
    Get detailed overview statistics for the dashboard using real data.
    """
    service = DashboardService(session, engine)
    return service.get_full_overview()
