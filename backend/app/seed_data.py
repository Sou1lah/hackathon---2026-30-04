"""
Seed script — creates fake users for development / demo.

Run with:
    cd backend && python -m app.seed_data

Creates:
  • 25 students  (mix of national & international)
  • 23 teachers  (mix of national & international professors)
  •  3 admins    (2 regular admins + 1 super-admin, all with full permissions)

Default password for every seeded account: password123
"""

import logging
import random

from sqlmodel import Session, select

from app.core.db import engine
from app.core.security import get_password_hash
from app.models import User, UserRole

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DEFAULT_PASSWORD = "password123"

# ──────────────────────────────────────────────
#  Algerian-flavoured names for realism
# ──────────────────────────────────────────────
_FIRST_NAMES_M = [
    "Mohamed", "Ahmed", "Yacine", "Amine", "Karim",
    "Walid", "Sofiane", "Bilal", "Hichem", "Riad",
    "Nassim", "Mehdi", "Farid", "Ismail", "Omar",
    "Nabil", "Mourad", "Khalil", "Samir", "Djelloul",
]
_FIRST_NAMES_F = [
    "Amina", "Fatima", "Nour", "Sara", "Meriem",
    "Khadija", "Lina", "Yasmine", "Imane", "Hadjer",
    "Asma", "Rania", "Salma", "Houda", "Wafa",
]
_LAST_NAMES = [
    "Benali", "Bouzid", "Khelifi", "Mebarki", "Bouazza",
    "Charef", "Hadj", "Belkacemi", "Mansouri", "Djebbar",
    "Larbi", "Ziani", "Toumi", "Ferhat", "Aouf",
    "Taleb", "Chabane", "Benmoussa", "Boudissa", "Ouali",
    "Rahmouni", "Belhadj", "Guendouz", "Amrani", "Slimani",
]

_SPECIALTIES = [
    "Informatique", "Génie Logiciel", "Intelligence Artificielle",
    "Réseaux & Télécommunications", "Cybersécurité",
    "Mathématiques Appliquées", "Génie Civil",
    "Électronique", "Automatique", "Bioinformatique",
]

_LEVELS = ["L1", "L2", "L3", "M1", "M2"]

_LANGUAGES = ["Arabe", "Français", "Anglais", "Arabe, Français", "Français, Anglais"]

_INTEREST_TAGS = [
    "machine-learning", "web-dev", "mobile-dev", "cloud-computing",
    "data-science", "cybersecurity", "devops", "embedded-systems",
    "blockchain", "iot", "nlp", "computer-vision", "robotics",
    "game-dev", "networking", "databases",
]


def _pick_name(index: int) -> tuple[str, str]:
    """Return (first_name, last_name) deterministically seeded by index."""
    all_first = _FIRST_NAMES_M + _FIRST_NAMES_F
    first = all_first[index % len(all_first)]
    last = _LAST_NAMES[index % len(_LAST_NAMES)]
    return first, last


def _random_tags(n: int = 3) -> list[str]:
    return random.sample(_INTEREST_TAGS, min(n, len(_INTEREST_TAGS)))


# ──────────────────────────────────────────────
#  Student definitions (25)
# ──────────────────────────────────────────────
STUDENTS: list[dict] = []
for i in range(25):
    first, last = _pick_name(i)
    role = UserRole.student_international if i % 5 == 0 else UserRole.student_national
    STUDENTS.append(
        {
            "email": f"{first.lower()}.{last.lower()}{i+1}@annaba.univ.dz",
            "full_name": f"{first} {last}",
            "role": role,
            "specialty": _SPECIALTIES[i % len(_SPECIALTIES)],
            "level": _LEVELS[i % len(_LEVELS)],
            "language": _LANGUAGES[i % len(_LANGUAGES)],
            "gpa": round(random.uniform(10.0, 18.5), 2),
            "mobility_preference": "international" if role == UserRole.student_international else "national",
            "interest_tags": _random_tags(3),
            # Student permissions
            "can_access_dashboard": True,
            "can_apply_internship": True,
            "can_view_convention": True,
            "can_view_tracking": True,
            "can_review_applications": False,
        }
    )

# ──────────────────────────────────────────────
#  Teacher / Professor definitions (23)
# ──────────────────────────────────────────────
TEACHERS: list[dict] = []
for i in range(23):
    first, last = _pick_name(i + 25)  # offset so names differ
    role = UserRole.prof_international if i % 6 == 0 else UserRole.prof_national
    TEACHERS.append(
        {
            "email": f"prof.{last.lower()}{i+1}@annaba.univ.dz",
            "full_name": f"Pr. {first} {last}",
            "role": role,
            "specialty": _SPECIALTIES[i % len(_SPECIALTIES)],
            "level": None,
            "language": _LANGUAGES[i % len(_LANGUAGES)],
            "gpa": None,
            "mobility_preference": "international" if role == UserRole.prof_international else "national",
            "interest_tags": _random_tags(4),
            # Teacher permissions
            "can_access_dashboard": True,
            "can_apply_internship": False,
            "can_view_convention": True,
            "can_view_tracking": True,
            "can_review_applications": False,
        }
    )

# ──────────────────────────────────────────────
#  Admin definitions (3)
# ──────────────────────────────────────────────
ADMINS: list[dict] = [
    {
        "email": "admin.principal@annaba.univ.dz",
        "full_name": "Admin Principal",
        "role": UserRole.admin,
        "is_superuser": True,
        "specialty": None,
        "level": None,
        "language": "Français",
        "gpa": None,
        "mobility_preference": None,
        "interest_tags": [],
        "can_access_dashboard": True,
        "can_apply_internship": True,
        "can_view_convention": True,
        "can_view_tracking": True,
        "can_review_applications": True,
    },
    {
        "email": "admin.scolarite@annaba.univ.dz",
        "full_name": "Admin Scolarité",
        "role": UserRole.admin,
        "is_superuser": False,
        "specialty": None,
        "level": None,
        "language": "Français",
        "gpa": None,
        "mobility_preference": None,
        "interest_tags": [],
        "can_access_dashboard": True,
        "can_apply_internship": True,
        "can_view_convention": True,
        "can_view_tracking": True,
        "can_review_applications": True,
    },
    {
        "email": "admin.stages@annaba.univ.dz",
        "full_name": "Admin Stages",
        "role": UserRole.admin,
        "is_superuser": False,
        "specialty": None,
        "level": None,
        "language": "Français",
        "gpa": None,
        "mobility_preference": None,
        "interest_tags": [],
        "can_access_dashboard": True,
        "can_apply_internship": True,
        "can_view_convention": True,
        "can_view_tracking": True,
        "can_review_applications": True,
    },
]


def _upsert_user(session: Session, data: dict) -> None:
    """Insert a user if not already present (idempotent by email)."""
    existing = session.exec(select(User).where(User.email == data["email"])).first()
    if existing:
        logger.info(f"  ⏭  Already exists: {data['email']}")
        return

    user = User(
        email=data["email"],
        full_name=data["full_name"],
        hashed_password=get_password_hash(DEFAULT_PASSWORD),
        role=data["role"],
        is_superuser=data.get("is_superuser", False),
        is_active=True,
        specialty=data.get("specialty"),
        level=data.get("level"),
        language=data.get("language"),
        gpa=data.get("gpa"),
        mobility_preference=data.get("mobility_preference"),
        interest_tags=data.get("interest_tags", []),
        # Permission flags
        can_access_dashboard=data.get("can_access_dashboard", False),
        can_apply_internship=data.get("can_apply_internship", False),
        can_view_convention=data.get("can_view_convention", False),
        can_view_tracking=data.get("can_view_tracking", False),
        can_review_applications=data.get("can_review_applications", False),
    )
    session.add(user)
    session.commit()
    logger.info(f"  ✅ Created: {data['email']}  ({data['role'].value})")


def main() -> None:
    random.seed(42)  # reproducible

    with Session(engine) as session:
        logger.info("=" * 60)
        logger.info("🎓 Seeding STUDENTS (25)")
        logger.info("=" * 60)
        for s in STUDENTS:
            _upsert_user(session, s)

        logger.info("")
        logger.info("=" * 60)
        logger.info("👨‍🏫 Seeding TEACHERS (23)")
        logger.info("=" * 60)
        for t in TEACHERS:
            _upsert_user(session, t)

        logger.info("")
        logger.info("=" * 60)
        logger.info("🔑 Seeding ADMINS (3)")
        logger.info("=" * 60)
        for a in ADMINS:
            _upsert_user(session, a)

        logger.info("")
        logger.info("=" * 60)

        # Summary
        total_students = session.exec(
            select(User).where(User.role.in_([UserRole.student_national, UserRole.student_international]))
        ).all()
        total_teachers = session.exec(
            select(User).where(User.role.in_([UserRole.prof_national, UserRole.prof_international]))
        ).all()
        total_admins = session.exec(
            select(User).where(User.role == UserRole.admin)
        ).all()

        logger.info(f"📊 SUMMARY:")
        logger.info(f"   Students : {len(total_students)}")
        logger.info(f"   Teachers : {len(total_teachers)}")
        logger.info(f"   Admins   : {len(total_admins)}")
        logger.info(f"   TOTAL    : {len(total_students) + len(total_teachers) + len(total_admins)}")
        logger.info("=" * 60)
        logger.info("🔐 Default password for all seeded users: password123")
        logger.info("=" * 60)


if __name__ == "__main__":
    main()
