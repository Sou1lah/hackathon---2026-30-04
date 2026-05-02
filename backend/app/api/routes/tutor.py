import uuid
from typing import Any, List
from fastapi import APIRouter, HTTPException
from sqlmodel import select, col, or_, func

from app.api.deps import SessionDep, CurrentUser
from app.models import User, UserPublic, Message, Tutorship, TutorshipStatus, UserRole
from app.models_suivi import ActivityLog, ActivityLogPublic, ActivityLogsPublic, TutorFeedback, TutorFeedbackCreate, TutorFeedbackPublic
from app.utils import get_datetime_utc

router = APIRouter(prefix="/tutor", tags=["tutor"])

@router.get("/search-students", response_model=List[UserPublic])
def search_students(
    session: SessionDep,
    current_user: CurrentUser,
    query: str | None = None,
) -> Any:
    """
    Search for students to tutor.
    """
    if not current_user.role.startswith("prof_"):
        raise HTTPException(status_code=403, detail="Only professors can search for students")

    statement = select(User).where(
        or_(
            User.role == UserRole.student_national,
            User.role == UserRole.student_international
        )
    )
    if query:
        statement = statement.where(
            or_(
                User.full_name.ilike(f"%{query}%"),
                User.email.ilike(f"%{query}%")
            )
        )
    
    students = session.exec(statement.limit(20)).all()
    return students

@router.post("/request", response_model=Message)
def send_tutorship_request(
    session: SessionDep,
    current_user: CurrentUser,
    student_id: uuid.UUID
) -> Any:
    """
    Send a tutorship request to a student.
    """
    if not current_user.role.startswith("prof_"):
        raise HTTPException(status_code=403, detail="Only professors can send tutorship requests")

    # Check if student exists
    student = session.get(User, student_id)
    if not student or not student.role.startswith("student_"):
        raise HTTPException(status_code=404, detail="Student not found")

    # Check if a link already exists
    statement = select(Tutorship).where(
        Tutorship.tutor_id == current_user.id,
        Tutorship.student_id == student_id
    )
    existing = session.exec(statement).first()
    if existing:
        return Message(message="Request already exists or tutorship already established")

    tutorship = Tutorship(
        tutor_id=current_user.id,
        student_id=student_id,
        status=TutorshipStatus.pending
    )
    session.add(tutorship)
    session.commit()
    return Message(message="Tutorship request sent successfully")

@router.get("/requests", response_model=List[Any]) # Simplified for now
def get_tutorship_requests(
    session: SessionDep,
    current_user: CurrentUser
) -> Any:
    """
    Get pending tutorship requests for the current student.
    """
    if not current_user.role.startswith("student_"):
        return []

    statement = select(Tutorship).where(
        Tutorship.student_id == current_user.id,
        Tutorship.status == TutorshipStatus.pending
    )
    requests = session.exec(statement).all()
    
    results = []
    for r in requests:
        tutor = session.get(User, r.tutor_id)
        results.append({
            "id": r.id,
            "tutor_name": tutor.full_name if tutor else "Unknown",
            "tutor_email": tutor.email if tutor else "Unknown",
            "created_at": r.created_at
        })
    return results

@router.patch("/request/{tutorship_id}", response_model=Message)
def handle_tutorship_request(
    tutorship_id: uuid.UUID,
    status: TutorshipStatus,
    session: SessionDep,
    current_user: CurrentUser
) -> Any:
    """
    Accept or reject a tutorship request.
    """
    tutorship = session.get(Tutorship, tutorship_id)
    if not tutorship or tutorship.student_id != current_user.id:
        raise HTTPException(status_code=404, detail="Request not found")

    if status not in [TutorshipStatus.accepted, TutorshipStatus.rejected]:
        raise HTTPException(status_code=400, detail="Invalid status")

    tutorship.status = status
    tutorship.updated_at = get_datetime_utc()
    session.add(tutorship)
    session.commit()
    
    return Message(message=f"Request {status}")

@router.get("/my-students", response_model=List[Any])
def get_my_students(
    session: SessionDep,
    current_user: CurrentUser
) -> Any:
    """
    List accepted students for the current tutor with metrics.
    """
    if not current_user.role.startswith("prof_"):
        raise HTTPException(status_code=403, detail="Only professors can access this")

    statement = select(Tutorship).where(
        Tutorship.tutor_id == current_user.id,
        Tutorship.status == TutorshipStatus.accepted
    )
    links = session.exec(statement).all()
    
    results = []
    for link in links:
        student = session.get(User, link.student_id)
        if not student:
            continue
            
        # Activity Presence: count of logs
        logs_count = session.exec(
            select(func.count()).select_from(ActivityLog).where(ActivityLog.owner_id == student.id)
        ).one()
        
        # Good Behavior: average rating from tutor feedback
        # Get all logs for this student
        student_logs_ids = session.exec(select(ActivityLog.id).where(ActivityLog.owner_id == student.id)).all()
        avg_rating = 0.0
        if student_logs_ids:
            avg_rating = session.exec(
                select(func.avg(TutorFeedback.rating)).where(col(TutorFeedback.log_id).in_(student_logs_ids))
            ).one() or 0.0
            
        results.append({
            "id": student.id,
            "full_name": student.full_name,
            "email": student.email,
            "specialty": student.specialty,
            "level": student.level,
            "logs_count": logs_count,
            "behavior_rating": round(float(avg_rating), 1),
            "favorite_rank": link.favorite_rank
        })
    return results

@router.patch("/student/{student_id}/rank", response_model=Message)
def update_student_rank(
    student_id: uuid.UUID,
    rank: int,
    session: SessionDep,
    current_user: CurrentUser
) -> Any:
    """
    Update a student's rank (favorite stars).
    """
    statement = select(Tutorship).where(
        Tutorship.tutor_id == current_user.id,
        Tutorship.student_id == student_id,
        Tutorship.status == TutorshipStatus.accepted
    )
    link = session.exec(statement).first()
    if not link:
        raise HTTPException(status_code=404, detail="Tutorship link not found")
        
    if not (0 <= rank <= 5):
        raise HTTPException(status_code=400, detail="Rank must be between 0 and 5")
        
    link.favorite_rank = rank
    session.add(link)
    session.commit()
    return Message(message="Rank updated")

@router.get("/student/{student_id}/logs", response_model=ActivityLogsPublic)
def get_student_logs(
    student_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Access logs of a tutored student.
    """
    # Check if linked
    statement = select(Tutorship).where(
        Tutorship.tutor_id == current_user.id,
        Tutorship.student_id == student_id,
        Tutorship.status == TutorshipStatus.accepted
    )
    link = session.exec(statement).first()
    if not link and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="You are not tutoring this student")

    log_statement = select(ActivityLog).where(ActivityLog.owner_id == student_id).offset(skip).limit(limit)
    logs = session.exec(log_statement).all()
    count = session.exec(select(func.count()).select_from(ActivityLog).where(ActivityLog.owner_id == student_id)).one()
    
    return ActivityLogsPublic(
        data=[ActivityLogPublic.model_validate(l) for l in logs],
        count=count
    )

@router.post("/log/{log_id}/comment", response_model=TutorFeedbackPublic)
def add_log_comment(
    log_id: uuid.UUID,
    feedback_in: TutorFeedbackCreate,
    session: SessionDep,
    current_user: CurrentUser
) -> Any:
    """
    Add a comment to a student's log.
    """
    log = session.get(ActivityLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    # Check if linked
    statement = select(Tutorship).where(
        Tutorship.tutor_id == current_user.id,
        Tutorship.student_id == log.owner_id,
        Tutorship.status == TutorshipStatus.accepted
    )
    link = session.exec(statement).first()
    if not link and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="You are not tutoring this student")

    feedback = TutorFeedback(
        log_id=log_id,
        owner_id=current_user.id,
        comment=feedback_in.comment,
        rating=feedback_in.rating
    )
    session.add(feedback)
    session.commit()
    session.refresh(feedback)
    return feedback
