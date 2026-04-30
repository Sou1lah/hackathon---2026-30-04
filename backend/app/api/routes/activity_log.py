import uuid
from typing import Any

from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.crud_mobility import create_activity_log_entry, get_activity_log_entries
from app.models_mobility import (
    ActivityLogEntriesPublic,
    ActivityLogEntryCreate,
    ActivityLogEntryPublic,
)

router = APIRouter(prefix="/activity-log", tags=["activity-log"])


@router.get("/", response_model=ActivityLogEntriesPublic)
def read_activity_log(
    session: SessionDep,
    current_user: CurrentUser,
    internship_request_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve activity log entries for a specific internship request.
    """
    items, count = get_activity_log_entries(
        session=session,
        internship_request_id=internship_request_id,
        skip=skip,
        limit=limit,
    )
    return ActivityLogEntriesPublic(
        data=[ActivityLogEntryPublic.model_validate(i) for i in items], count=count
    )


@router.post("/", response_model=ActivityLogEntryPublic)
def create_log_entry(
    *, session: SessionDep, current_user: CurrentUser, entry_in: ActivityLogEntryCreate
) -> Any:
    """
    Create a new activity log entry.
    """
    return create_activity_log_entry(
        session=session, entry_in=entry_in, owner_id=current_user.id
    )
