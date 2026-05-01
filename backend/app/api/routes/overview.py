from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/overview", tags=["overview"])

class ActivityItem(BaseModel):
    id: str
    description: str
    date: str

class OverviewStats(BaseModel):
    total_users: int
    total_requests: int
    pending_items: int
    recent_activity: List[ActivityItem]

@router.get("/", response_model=OverviewStats)
def get_overview_data():
    """
    Get simple overview statistics for the new dashboard.
    """
    return OverviewStats(
        total_users=150,
        total_requests=342,
        pending_items=12,
        recent_activity=[
            ActivityItem(id="1", description="System initialization complete", date="2026-05-01"),
            ActivityItem(id="2", description="New user registered", date="2026-05-01"),
            ActivityItem(id="3", description="Routine maintenance check", date="2026-04-30"),
        ]
    )
