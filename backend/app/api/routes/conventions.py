import uuid
from typing import Any

from fastapi import APIRouter, HTTPException, Depends

from app.api.deps import (
    CurrentReviewer,
    CurrentUser,
    SessionDep,
    require_permission,
)
from app.crud_mobility import (
    advance_signature,
    approve_convention,
    create_convention,
    delete_convention,
    forward_convention,
    get_convention,
    get_conventions,
    get_conventions_for_admin,
    reject_convention,
    update_convention,
)
from app.models import Message
from app.models_mobility import (
    ApprovalLevel,
    ConventionCreate,
    ConventionPublic,
    ConventionsPublic,
    ConventionUpdate,
)

router = APIRouter(prefix="/conventions", tags=["conventions"])


# ── Student / owner endpoints ────────────────────────────────────────────────

@router.get("/", response_model=ConventionsPublic)
def read_conventions(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve conventions for the current user.
    Requires can_view_convention permission (enforced by sidebar/route guard on
    the frontend; backend returns data only for own records).
    """
    if not current_user.is_superuser and not current_user.can_view_convention:
        raise HTTPException(status_code=403, detail="Access denied: 'can_view_convention' required")
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
    if not current_user.is_superuser and not current_user.can_view_convention:
        raise HTTPException(status_code=403, detail="Access denied: 'can_view_convention' required")
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
    Create new convention.  Requires can_apply_internship permission.
    """
    if not current_user.is_superuser and not current_user.can_apply_internship:
        raise HTTPException(status_code=403, detail="Access denied: 'can_apply_internship' required")
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
    if not current_user.is_superuser and not current_user.can_view_convention:
        raise HTTPException(status_code=403, detail="Access denied: 'can_view_convention' required")
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
    if not current_user.is_superuser and not current_user.can_view_convention:
        raise HTTPException(status_code=403, detail="Access denied: 'can_view_convention' required")
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


# ── Reviewer / Admin endpoints (DB permission: can_review_applications) ──────

@router.get("/admin/all", response_model=ConventionsPublic)
def read_all_conventions_admin(
    session: SessionDep,
    current_reviewer: CurrentReviewer,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all conventions for reviewers.
    Permission: can_review_applications (DB field).
    """
    # Superusers get N3 view; all other reviewers get N1 by default.
    # More granular level routing can be added via additional DB fields if needed.
    if current_reviewer.is_superuser:
        level = ApprovalLevel.N3
    else:
        level = ApprovalLevel.N1

    items, count = get_conventions_for_admin(
        session=session, approval_level=level, skip=skip, limit=limit
    )
    return ConventionsPublic(
        data=[ConventionPublic.model_validate(i) for i in items], count=count
    )


@router.post("/{id}/approve", response_model=ConventionPublic)
def approve_convention_endpoint(
    *,
    session: SessionDep,
    current_reviewer: CurrentReviewer,
    id: uuid.UUID,
) -> Any:
    """
    Approve a convention.
    Permission: can_review_applications (DB field).
    """
    db_convention = get_convention(session=session, convention_id=id)
    if not db_convention:
        raise HTTPException(status_code=404, detail="Convention not found")

    return approve_convention(
        session=session, db_convention=db_convention, admin_id=current_reviewer.id
    )


@router.post("/{id}/reject", response_model=ConventionPublic)
def reject_convention_endpoint(
    *,
    session: SessionDep,
    current_reviewer: CurrentReviewer,
    id: uuid.UUID,
    reason: str = "Rejected by administrator",
) -> Any:
    """
    Reject a convention.
    Permission: can_review_applications (DB field).
    """
    db_convention = get_convention(session=session, convention_id=id)
    if not db_convention:
        raise HTTPException(status_code=404, detail="Convention not found")

    return reject_convention(
        session=session,
        db_convention=db_convention,
        admin_id=current_reviewer.id,
        reason=reason,
    )


@router.post("/{id}/forward", response_model=ConventionPublic)
def forward_convention_endpoint(
    *,
    session: SessionDep,
    current_reviewer: CurrentReviewer,
    id: uuid.UUID,
    next_level: ApprovalLevel,
) -> Any:
    """
    Forward a convention to a specific approval level.
    Only superusers may forward freely; reviewers forward within their scope.
    """
    db_convention = get_convention(session=session, convention_id=id)
    if not db_convention:
        raise HTTPException(status_code=404, detail="Convention not found")

    return forward_convention(
        session=session,
        db_convention=db_convention,
        admin_id=current_reviewer.id,
        next_level=next_level,
    )
