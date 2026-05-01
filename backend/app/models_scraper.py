import uuid
from datetime import date, datetime, timezone

from sqlalchemy import DateTime, JSON
from sqlmodel import Column, Field, SQLModel

from app.utils import get_datetime_utc


# ---------- InternshipOffer ----------

class InternshipOfferBase(SQLModel):
    title: str = Field(max_length=500)
    description: str | None = Field(default=None, max_length=5000)
    source_url: str = Field(max_length=1000, unique=True, index=True)
    published_date: date | None = None
    target_audience: str | None = Field(default="both", max_length=50) # student, teacher, both
    mobility_type: str | None = Field(default="national", max_length=50) # national, international
    keywords: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    translated_description: str | None = Field(default=None)
    specialty: str | None = Field(default=None, max_length=100)
    required_level: str | None = Field(default=None, max_length=50)
    required_language: str | None = Field(default=None, max_length=50)
    gpa_requirement: float | None = Field(default=None)


class InternshipOffer(InternshipOfferBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


class InternshipOfferPublic(InternshipOfferBase):
    id: uuid.UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None


class InternshipOffersPublic(SQLModel):
    data: list[InternshipOfferPublic]
    count: int
