import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, SessionDep
from app.crud_mobility import (
    create_mobility_file,
    delete_mobility_file,
    get_mobility_file,
    get_mobility_files,
    update_mobility_file,
)
from app.models import Message
from app.models_mobility import (
    MobilityFileCreate,
    MobilityFilePublic,
    MobilityFilesPublic,
    MobilityFileUpdate,
    MobilityType,
)

router = APIRouter(prefix="/mobility", tags=["mobility"])


@router.get("/", response_model=MobilityFilesPublic)
def read_mobility_files(
    session: SessionDep,
    current_user: CurrentUser,
    mobility_type: MobilityType | None = None,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve mobility files, optionally filtered by type (nationale/internationale).
    """
    items, count = get_mobility_files(
        session=session,
        owner_id=current_user.id,
        mobility_type=mobility_type,
        skip=skip,
        limit=limit,
    )
    return MobilityFilesPublic(
        data=[MobilityFilePublic.model_validate(i) for i in items], count=count
    )


@router.get("/{id}", response_model=MobilityFilePublic)
def read_mobility_file(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    """
    Get mobility file by ID.
    """
    file = get_mobility_file(session=session, file_id=id)
    if not file:
        raise HTTPException(status_code=404, detail="Mobility file not found")
    if file.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return file


@router.post("/", response_model=MobilityFilePublic)
def create_mobility(
    *, session: SessionDep, current_user: CurrentUser, file_in: MobilityFileCreate
) -> Any:
    """
    Create new mobility file.
    """
    return create_mobility_file(
        session=session, file_in=file_in, owner_id=current_user.id
    )


@router.put("/{id}", response_model=MobilityFilePublic)
def update_mobility(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    file_in: MobilityFileUpdate,
) -> Any:
    """
    Update a mobility file.
    """
    db_file = get_mobility_file(session=session, file_id=id)
    if not db_file:
        raise HTTPException(status_code=404, detail="Mobility file not found")
    if db_file.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return update_mobility_file(session=session, db_file=db_file, file_in=file_in)


@router.delete("/{id}")
def delete_mobility(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete a mobility file.
    """
    db_file = get_mobility_file(session=session, file_id=id)
    if not db_file:
        raise HTTPException(status_code=404, detail="Mobility file not found")
    if db_file.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    delete_mobility_file(session=session, db_file=db_file)
    return Message(message="Mobility file deleted successfully")
