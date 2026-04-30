import uuid
from datetime import datetime, timezone
from typing import Any

from sqlmodel import Session, col, func, select

from app.models_mobility import (
    ActivityLogEntry,
    ActivityLogEntryCreate,
    Convention,
    ConventionCreate,
    ConventionUpdate,
    DashboardStats,
    InternshipRequest,
    InternshipRequestCreate,
    InternshipRequestUpdate,
    InternshipStatus,
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
