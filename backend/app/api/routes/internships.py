import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, SessionDep
from app.crud_mobility import (
    create_internship_request,
    delete_internship_request,
    get_internship_request,
    get_internship_requests,
    update_internship_request,
)
from app.models import Message
from app.models_mobility import (
    InternshipRequestCreate,
    InternshipRequestPublic,
    InternshipRequestsPublic,
    InternshipRequestUpdate,
)

router = APIRouter(prefix="/internship-requests", tags=["internships"])


@router.get("/", response_model=InternshipRequestsPublic)
def read_internship_requests(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve internship requests for the current user.
    """
    items, count = get_internship_requests(
        session=session, owner_id=current_user.id, skip=skip, limit=limit
    )
    return InternshipRequestsPublic(
        data=[InternshipRequestPublic.model_validate(i) for i in items], count=count
    )


@router.get("/{id}", response_model=InternshipRequestPublic)
def read_internship_request(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    """
    Get internship request by ID.
    """
    request = get_internship_request(session=session, request_id=id)
    if not request:
        raise HTTPException(status_code=404, detail="Internship request not found")
    if request.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return request


@router.post("/", response_model=InternshipRequestPublic)
def create_internship(
    *, session: SessionDep, current_user: CurrentUser, request_in: InternshipRequestCreate
) -> Any:
    """
    Create new internship request.
    Requires can_apply_internship DB permission.
    """
    if not current_user.is_superuser and not current_user.can_apply_internship:
        raise HTTPException(status_code=403, detail="Access denied: 'can_apply_internship' required")
    return create_internship_request(
        session=session, request_in=request_in, owner_id=current_user.id
    )


@router.put("/{id}", response_model=InternshipRequestPublic)
def update_internship(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    request_in: InternshipRequestUpdate,
) -> Any:
    """
    Update an internship request.
    """
    db_request = get_internship_request(session=session, request_id=id)
    if not db_request:
        raise HTTPException(status_code=404, detail="Internship request not found")
    if db_request.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return update_internship_request(
        session=session, db_request=db_request, request_in=request_in
    )


@router.delete("/{id}")
def delete_internship(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an internship request.
    """
    db_request = get_internship_request(session=session, request_id=id)
    if not db_request:
        raise HTTPException(status_code=404, detail="Internship request not found")
    if db_request.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    delete_internship_request(session=session, db_request=db_request)
    return Message(message="Internship request deleted successfully")
