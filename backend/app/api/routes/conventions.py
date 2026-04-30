import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, SessionDep
from app.crud_mobility import (
    advance_signature,
    create_convention,
    delete_convention,
    get_convention,
    get_conventions,
    update_convention,
)
from app.models import Message
from app.models_mobility import (
    ConventionCreate,
    ConventionPublic,
    ConventionsPublic,
    ConventionUpdate,
)

router = APIRouter(prefix="/conventions", tags=["conventions"])


@router.get("/", response_model=ConventionsPublic)
def read_conventions(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve conventions for the current user.
    """
    items, count = get_conventions(
        session=session, owner_id=current_user.id, skip=skip, limit=limit
    )
    return ConventionsPublic(
        data=[ConventionPublic.model_validate(i) for i in items], count=count
    )


@router.get("/{id}", response_model=ConventionPublic)
def read_convention(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    """
    Get convention by ID.
    """
    convention = get_convention(session=session, convention_id=id)
    if not convention:
        raise HTTPException(status_code=404, detail="Convention not found")
    if convention.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return convention


@router.post("/", response_model=ConventionPublic)
def create_convention_endpoint(
    *, session: SessionDep, current_user: CurrentUser, convention_in: ConventionCreate
) -> Any:
    """
    Create new convention.
    """
    return create_convention(
        session=session, convention_in=convention_in, owner_id=current_user.id
    )


@router.put("/{id}", response_model=ConventionPublic)
def update_convention_endpoint(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    convention_in: ConventionUpdate,
) -> Any:
    """
    Update a convention.
    """
    db_convention = get_convention(session=session, convention_id=id)
    if not db_convention:
        raise HTTPException(status_code=404, detail="Convention not found")
    if db_convention.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return update_convention(
        session=session, db_convention=db_convention, convention_in=convention_in
    )


@router.post("/{id}/sign", response_model=ConventionPublic)
def sign_convention(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    """
    Advance the convention to the next signature step.
    """
    db_convention = get_convention(session=session, convention_id=id)
    if not db_convention:
        raise HTTPException(status_code=404, detail="Convention not found")
    if db_convention.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return advance_signature(session=session, db_convention=db_convention)


@router.delete("/{id}")
def delete_convention_endpoint(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete a convention.
    """
    db_convention = get_convention(session=session, convention_id=id)
    if not db_convention:
        raise HTTPException(status_code=404, detail="Convention not found")
    if db_convention.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    delete_convention(session=session, db_convention=db_convention)
    return Message(message="Convention deleted successfully")
