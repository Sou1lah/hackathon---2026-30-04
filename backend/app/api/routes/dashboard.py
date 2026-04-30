from typing import Any

from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.crud_mobility import get_dashboard_stats
from app.models_mobility import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def read_dashboard_stats(
    session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Get aggregated dashboard statistics.
    """
    return get_dashboard_stats(session=session)
