import uuid
from typing import Any
from datetime import datetime
from sqlalchemy import DateTime, JSON
from sqlmodel import Column, Field, SQLModel
from app.utils import get_datetime_utc

class UserInteractionBase(SQLModel):
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False, ondelete="CASCADE")
    offer_id: uuid.UUID = Field(foreign_key="internshipoffer.id", nullable=False, ondelete="CASCADE")
    event_type: str = Field(max_length=50)  # view, click, save
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )

class UserInteraction(UserInteractionBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class UserInteractionPublic(UserInteractionBase):
    id: uuid.UUID

# ---------- StageRequest ----------

class StageRequestBase(SQLModel):
    selected_mobility_type: str = Field(max_length=50) # national, international, both
    selected_interests: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    duration_preference: str | None = Field(default=None, max_length=100)
    specialty: str | None = Field(default=None, max_length=255)
    level: str | None = Field(default=None, max_length=100)
    language: str | None = Field(default=None, max_length=255)
    gpa: float | None = Field(default=None)

class StageRequestCreate(StageRequestBase):
    pass

class StageRequest(StageRequestBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False, ondelete="CASCADE")
    submitted_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )
    processed: bool = Field(default=False)

class StageRequestPublic(StageRequestBase):
    id: uuid.UUID
    user_id: uuid.UUID
    submitted_at: datetime | None
    processed: bool

# ---------- Recommendation ----------

class RecommendationBase(SQLModel):
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False, ondelete="CASCADE")
    internship_id: uuid.UUID = Field(foreign_key="internshipoffer.id", nullable=False, ondelete="CASCADE")
    score: float
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )

class Recommendation(RecommendationBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class RecommendationPublic(RecommendationBase):
    id: uuid.UUID

from app.models_scraper import InternshipOfferPublic

# ---------- API Responses ----------

class RecommendationResultItem(SQLModel):
    offer: InternshipOfferPublic
    score: float
    breakdown: dict[str, float] | None = None
    warnings: list[str] | None = None

class RecommendationResponse(SQLModel):
    results: list[RecommendationResultItem]
    is_fallback: bool
    message: str | None
