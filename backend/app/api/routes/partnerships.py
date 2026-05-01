import uuid
from typing import Any
from fastapi import APIRouter, HTTPException
from app.api.deps import SessionDep, CurrentUser
from app.crud_partnership import (
    create_partnership,
    get_partnership,
    get_partnerships,
    update_partnership,
    delete_partnership,
)
from app.models import Message
from app.models_partnership import (
    PartnershipCreate,
    PartnershipPublic,
    PartnershipsPublic,
    PartnershipUpdate,
)

router = APIRouter(prefix="/partnerships", tags=["partnerships"])

@router.get("/", response_model=PartnershipsPublic)
def read_partnerships(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve partnerships/institutional conventions.
    """
    items, count = get_partnerships(session=session, skip=skip, limit=limit)
    return PartnershipsPublic(
        data=[PartnershipPublic.model_validate(i) for i in items], count=count
    )

@router.post("/", response_model=PartnershipPublic)
def create_partnership_endpoint(
    *, session: SessionDep, current_user: CurrentUser, partnership_in: PartnershipCreate
) -> Any:
    """
    Create new partnership (Admin only).
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return create_partnership(session=session, partnership_in=partnership_in)

@router.get("/{id}", response_model=PartnershipPublic)
def read_partnership(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    """
    Get partnership by ID.
    """
    partnership = get_partnership(session=session, partnership_id=id)
    if not partnership:
        raise HTTPException(status_code=404, detail="Partnership not found")
    return partnership

@router.put("/{id}", response_model=PartnershipPublic)
def update_partnership_endpoint(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    partnership_in: PartnershipUpdate,
) -> Any:
    """
    Update a partnership (Admin only).
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    partnership = get_partnership(session=session, partnership_id=id)
    if not partnership:
        raise HTTPException(status_code=404, detail="Partnership not found")
    return update_partnership(
        session=session, db_partnership=partnership, partnership_in=partnership_in
    )

@router.delete("/{id}")
def delete_partnership_endpoint(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete a partnership (Admin only).
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    partnership = get_partnership(session=session, partnership_id=id)
    if not partnership:
        raise HTTPException(status_code=404, detail="Partnership not found")
    delete_partnership(session=session, db_partnership=partnership)
    return Message(message="Partnership deleted successfully")
