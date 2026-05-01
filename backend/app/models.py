import uuid
from datetime import datetime, timezone

from enum import Enum
from pydantic import EmailStr, field_validator
from typing import Any
from sqlalchemy import DateTime, JSON
from sqlmodel import Column, Field, Relationship, SQLModel
from app.models_scraper import InternshipOffer
from app.models_recommendation import UserInteraction
from app.utils import get_datetime_utc


class UserRole(str, Enum):
    student_national = "student_national"
    student_international = "student_international"
    prof_national = "prof_national"
    prof_international = "prof_international"
    admin = "admin"


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)
    role: UserRole = Field(default=UserRole.student_national)
    specialty: str | None = Field(default=None, max_length=255)
    level: str | None = Field(default=None, max_length=100)
    language: str | None = Field(default=None, max_length=255)
    gpa: float | None = Field(default=None)

    @field_validator("email")
    @classmethod
    def validate_email_domain(cls, v: str) -> str:
        if not v.endswith(".univ.dz") and v not in ["admin@example.com", "test@example.com"]:
            raise ValueError("Only university emails (.univ.dz) are allowed")
        return v


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)
    role: UserRole = Field(default=UserRole.student_national)

    @field_validator("email")
    @classmethod
    def validate_email_domain(cls, v: str) -> str:
        if not v.endswith(".univ.dz") and v not in ["admin@example.com", "test@example.com"]:
            raise ValueError("Only university emails (.univ.dz) are allowed")
        return v


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore[assignment]
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    # Recommendation features (non-editable by user directly)
    role_type: str | None = Field(default=None, max_length=50)
    mobility_preference: str | None = Field(default="national", max_length=50)
    interest_tags: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    recommendation_score_profile: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))

    # Activity tracking
    last_login_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    total_sessions: int = Field(default=0)
    engagement_score: float = Field(default=0.0)
    profile_locked: bool = Field(default=True)

    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime | None = None
    role_type: str | None = None
    mobility_preference: str | None = None
    interest_tags: list[str] = []
    specialty: str | None = None
    level: str | None = None
    language: str | None = None
    gpa: float | None = None


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore[assignment]


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime | None = None


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)
