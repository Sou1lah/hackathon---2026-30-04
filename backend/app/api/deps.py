from collections.abc import Generator
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlmodel import Session

from app.core import security
from app.core.config import settings
from app.core.db import engine
from app.models import TokenPayload, User

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]


def get_current_user(session: SessionDep, token: TokenDep) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = session.get(User, token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user


def require_permission(flag: str):
    """
    Factory that returns a FastAPI dependency which checks a DB boolean
    permission field on the current user.  Superusers always pass.

    Usage:
        @router.get("/...", dependencies=[Depends(require_permission("can_view_convention"))])
    """
    def _check(current_user: CurrentUser) -> User:
        if current_user.is_superuser:
            return current_user
        if not getattr(current_user, flag, False):
            raise HTTPException(
                status_code=403,
                detail=f"Access denied: '{flag}' permission required",
            )
        return current_user

    # Give the inner function a unique name so FastAPI can distinguish deps
    _check.__name__ = f"require_{flag}"
    return _check


# ── Convenience aliases (DB-driven, no role logic) ──────────────────────────

def get_current_reviewer(current_user: CurrentUser) -> User:
    """Users who can review / approve applications."""
    if current_user.is_superuser:
        return current_user
    if not current_user.can_review_applications:
        raise HTTPException(
            status_code=403, detail="Access denied: 'can_review_applications' required"
        )
    return current_user


CurrentReviewer = Annotated[User, Depends(get_current_reviewer)]
