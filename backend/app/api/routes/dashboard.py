from typing import Any

from fastapi import APIRouter

from app.api.deps import CurrentAdmin, SessionDep
from app.crud_mobility import get_dashboard_stats
from app.models_mobility import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def read_dashboard_stats(
    session: SessionDep, current_admin: CurrentAdmin
) -> Any:
    """
    Get aggregated dashboard statistics.
    """
    return get_dashboard_stats(session=session)
