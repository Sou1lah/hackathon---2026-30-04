import logging
from sqlmodel import Session, select
from app.core.db import engine
from app.models import User, UserCreate, UserRole
from app import crud

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_admin(
    session: Session,
    email: str,
    password: str,
    full_name: str,
    is_superuser: bool = False,
    permissions: dict | None = None,
):
    """
    Create or update an admin-level user with the given DB permission flags.
    Role is always 'admin' — the role field is metadata only.
    Actual access is governed by the boolean permission flags.
    """
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        user_in = UserCreate(
            email=email,
            password=password,
            full_name=full_name,
            role=UserRole.admin,          # role is metadata only
            is_superuser=is_superuser,
        )
        db_user = crud.create_user(session=session, user_create=user_in)
        # Apply DB-driven permission flags
        if permissions:
            for flag, value in permissions.items():
                setattr(db_user, flag, value)
        session.add(db_user)
        session.commit()
        logger.info(f"Created user: {email} | is_superuser={is_superuser} | permissions={permissions}")
    else:
        # Idempotent — update permissions if they differ
        changed = False
        if permissions:
            for flag, value in permissions.items():
                if getattr(user, flag, None) != value:
                    setattr(user, flag, value)
                    changed = True
        if changed:
            session.add(user)
            session.commit()
            logger.info(f"Updated permissions for: {email}")
        else:
            logger.info(f"No changes for: {email}")


# Full permission set for reviewer / admin accounts
_REVIEWER_PERMISSIONS = {
    "can_access_dashboard": True,
    "can_apply_internship": True,
    "can_view_convention": True,
    "can_view_tracking": True,
    "can_review_applications": True,
}


def main() -> None:
    with Session(engine) as session:
        # Reviewer admin 1
        create_admin(
            session,
            email="admin1@annaba.univ.dz",
            password="admin123",
            full_name="Admin Niveau 1",
            permissions=_REVIEWER_PERMISSIONS,
        )
        # Reviewer admin 2
        create_admin(
            session,
            email="admin2@annaba.univ.dz",
            password="admin123",
            full_name="Admin Niveau 2",
            permissions=_REVIEWER_PERMISSIONS,
        )
        # Super Admin
        create_admin(
            session,
            email="superadmin@annaba.univ.dz",
            password="admin123",
            full_name="Super Administrateur",
            is_superuser=True,
            permissions=_REVIEWER_PERMISSIONS,
        )


if __name__ == "__main__":
    main()
