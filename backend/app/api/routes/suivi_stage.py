import uuid
from typing import Any, List
from fastapi import APIRouter, HTTPException
from app.api.deps import SessionDep, CurrentUser, get_current_active_superuser
from app.crud_suivi import (
    create_activity_log,
    get_activity_logs,
    get_all_activity_logs,
    get_user_activity_logs,
    get_feedback_for_internship,
    create_tutor_feedback,
    update_activity_log,
    delete_activity_log
)
from app.models_suivi import (
    ActivityLog,
    ActivityLogCreate,
    ActivityLogPublic,
    ActivityLogsPublic,
    TutorFeedbackCreate,
    TutorFeedbackPublic
)
from app.models import Message
from app.models_mobility import InternshipRequest
from sqlmodel import select, col
from app.crud_mobility import get_internship_summary_data

router = APIRouter(prefix="/suivi-stage", tags=["suivi-stage"])

@router.get("/my-internship/logs", response_model=ActivityLogsPublic)
def read_my_logs(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve activity logs for the current user's active internship.
    """
    # Find the user's active internship
    statement = select(InternshipRequest).where(InternshipRequest.owner_id == current_user.id).limit(1)
    internship = session.exec(statement).first()
    if not internship:
        return ActivityLogsPublic(data=[], count=0)
    
    items, count = get_activity_logs(
        session=session, internship_id=internship.id, skip=skip, limit=limit
    )
    return ActivityLogsPublic(
        data=[ActivityLogPublic.model_validate(i) for i in items], count=count
    )

@router.post("/my-internship/logs", response_model=ActivityLogPublic)
def create_my_log(
    *, session: SessionDep, current_user: CurrentUser, log_in: ActivityLogCreate
) -> Any:
    """
    Create a new activity log entry for the current user's internship.
    """
    # Find the user's active internship
    statement = select(InternshipRequest).where(InternshipRequest.owner_id == current_user.id).limit(1)
    internship = session.exec(statement).first()
    if not internship:
        raise HTTPException(status_code=404, detail="No active internship found")
    
    # Force the internship_id to the user's internship
    log_in.internship_id = internship.id
    
    return create_activity_log(
        session=session, log_in=log_in, owner_id=current_user.id
    )

@router.put("/my-internship/logs/{id}", response_model=ActivityLogPublic)
def update_my_log(
    *, session: SessionDep, current_user: CurrentUser, id: uuid.UUID, log_in: ActivityLogCreate
) -> Any:
    """
    Update an activity log entry for the current user's internship.
    """
    db_log = session.get(ActivityLog, id)
    if not db_log:
        raise HTTPException(status_code=404, detail="Log entry not found")
    if db_log.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return update_activity_log(session=session, db_log=db_log, log_in=log_in)

@router.delete("/my-internship/logs/{id}")
def delete_my_log(
    *, session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an activity log entry for the current user's internship.
    """
    db_log = session.get(ActivityLog, id)
    if not db_log:
        raise HTTPException(status_code=404, detail="Log entry not found")
    if db_log.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    delete_activity_log(session=session, db_log=db_log)
    return Message(message="Log entry deleted successfully")

@router.get("/my-internship/feedback", response_model=List[TutorFeedbackPublic])
def read_my_feedback(
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Retrieve feedback for the current user's internship logs.
    """
    statement = select(InternshipRequest).where(InternshipRequest.owner_id == current_user.id).limit(1)
    internship = session.exec(statement).first()
    if not internship:
        return []
    
    feedbacks = get_feedback_for_internship(session=session, internship_id=internship.id)
    return [TutorFeedbackPublic.model_validate(f) for f in feedbacks]

@router.get("/my-internship/summary", response_model=dict[str, Any])
def read_my_summary(
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Retrieve summary data for the current user's internship.
    """
    statement = select(InternshipRequest).where(InternshipRequest.owner_id == current_user.id).order_by(col(InternshipRequest.created_at).desc()).limit(1)
    internship = session.exec(statement).first()
    if not internship:
        raise HTTPException(status_code=404, detail="No active internship found")
        
    return get_internship_summary_data(session=session, internship_request_id=internship.id)

@router.get("/admin/logs", response_model=ActivityLogsPublic)
def read_all_logs(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all activity logs (Admin only).
    """
    if not current_user.is_superuser and not current_user.can_review_applications:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    items, count = get_all_activity_logs(session=session, skip=skip, limit=limit)
    return ActivityLogsPublic(
        data=[ActivityLogPublic.model_validate(i) for i in items], count=count
    )

@router.get("/admin/users/{user_id}/logs", response_model=ActivityLogsPublic)
def read_user_logs(
    user_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve activity logs for a specific user (Admin only).
    """
    if not current_user.is_superuser and not current_user.can_review_applications:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    items, count = get_user_activity_logs(
        session=session, owner_id=user_id, skip=skip, limit=limit
    )
    return ActivityLogsPublic(
        data=[ActivityLogPublic.model_validate(i) for i in items], count=count
    )

@router.get("/admin/users/{user_id}/internship-summary", response_model=dict[str, Any])
def read_user_internship_summary(
    user_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Retrieve internship summary data for a specific user (Admin only).
    """
    if not current_user.is_superuser and not current_user.can_review_applications:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    statement = select(InternshipRequest).where(InternshipRequest.owner_id == user_id).order_by(col(InternshipRequest.created_at).desc()).limit(1)
    internship = session.exec(statement).first()
    if not internship:
        raise HTTPException(status_code=404, detail="No active internship found for this user")
        
    return get_internship_summary_data(session=session, internship_request_id=internship.id)

@router.post("/admin/feedback", response_model=TutorFeedbackPublic)
def create_feedback(
    *, session: SessionDep, current_user: CurrentUser, feedback_in: TutorFeedbackCreate
) -> Any:
    """
    Add tutor feedback to a log entry (Admin/Tutor only).
    """
    if not current_user.is_superuser and not current_user.can_review_applications:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return create_tutor_feedback(
        session=session, feedback_in=feedback_in, owner_id=current_user.id
    )
