import uuid
from typing import List, Tuple
from sqlmodel import Session, select, func, col
from sqlalchemy.orm import selectinload
from app.models_suivi import (
    ActivityLog, 
    ActivityLogCreate, 
    TutorFeedback, 
    TutorFeedbackCreate
)

def create_activity_log(
    *, session: Session, log_in: ActivityLogCreate, owner_id: uuid.UUID
) -> ActivityLog:
    db_obj = ActivityLog.model_validate(
        log_in, update={"owner_id": owner_id}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj

def update_activity_log(
    *, session: Session, db_log: ActivityLog, log_in: ActivityLogCreate
) -> ActivityLog:
    update_dict = log_in.model_dump(exclude_unset=True)
    db_log.sqlmodel_update(update_dict)
    session.add(db_log)
    session.commit()
    session.refresh(db_log)
    return db_log

def delete_activity_log(*, session: Session, db_log: ActivityLog) -> None:
    session.delete(db_log)
    session.commit()

def get_activity_logs(
    *, session: Session, internship_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> Tuple[List[ActivityLog], int]:
    count_statement = (
        select(func.count())
        .select_from(ActivityLog)
        .where(ActivityLog.internship_id == internship_id)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(ActivityLog)
        .options(selectinload(ActivityLog.feedback))
        .where(ActivityLog.internship_id == internship_id)
        .order_by(col(ActivityLog.date).desc())
        .offset(skip)
        .limit(limit)
    )
    items = session.exec(statement).all()
    return list(items), count

def get_all_activity_logs(
    *, session: Session, skip: int = 0, limit: int = 100
) -> Tuple[List[ActivityLog], int]:
    count_statement = select(func.count()).select_from(ActivityLog)
    count = session.exec(count_statement).one()
    statement = (
        select(ActivityLog)
        .options(selectinload(ActivityLog.feedback), selectinload(ActivityLog.owner))
        .order_by(col(ActivityLog.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    items = session.exec(statement).all()
    return list(items), count

def get_user_activity_logs(
    *, session: Session, owner_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> Tuple[List[ActivityLog], int]:
    count_statement = (
        select(func.count())
        .select_from(ActivityLog)
        .where(ActivityLog.owner_id == owner_id)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(ActivityLog)
        .options(selectinload(ActivityLog.feedback))
        .where(ActivityLog.owner_id == owner_id)
        .order_by(col(ActivityLog.date).desc())
        .offset(skip)
        .limit(limit)
    )
    items = session.exec(statement).all()
    return list(items), count

def create_tutor_feedback(
    *, session: Session, feedback_in: TutorFeedbackCreate, owner_id: uuid.UUID
) -> TutorFeedback:
    db_obj = TutorFeedback.model_validate(
        feedback_in, update={"owner_id": owner_id}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj

def get_feedback_for_internship(
    *, session: Session, internship_id: uuid.UUID
) -> List[TutorFeedback]:
    statement = (
        select(TutorFeedback)
        .join(ActivityLog)
        .where(ActivityLog.internship_id == internship_id)
    )
    return list(session.exec(statement).all())
