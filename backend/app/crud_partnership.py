import uuid
from typing import List, Tuple
from sqlmodel import Session, select, func, col

from app.models_partnership import Partnership, PartnershipCreate, PartnershipUpdate

def create_partnership(
    *, session: Session, partnership_in: PartnershipCreate
) -> Partnership:
    db_obj = Partnership.model_validate(partnership_in)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj

def get_partnership(
    *, session: Session, partnership_id: uuid.UUID
) -> Partnership | None:
    return session.get(Partnership, partnership_id)

def get_partnerships(
    *, session: Session, skip: int = 0, limit: int = 100
) -> Tuple[List[Partnership], int]:
    count_statement = select(func.count()).select_from(Partnership)
    count = session.exec(count_statement).one()
    
    statement = (
        select(Partnership)
        .order_by(col(Partnership.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    items = session.exec(statement).all()
    return list(items), count

def update_partnership(
    *, session: Session, db_partnership: Partnership, partnership_in: PartnershipUpdate
) -> Partnership:
    partnership_data = partnership_in.model_dump(exclude_unset=True)
    db_partnership.sqlmodel_update(partnership_data)
    session.add(db_partnership)
    session.commit()
    session.refresh(db_partnership)
    return db_partnership

def delete_partnership(
    *, session: Session, db_partnership: Partnership
) -> None:
    session.delete(db_partnership)
    session.commit()
