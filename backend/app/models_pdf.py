import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import JSON, Column, DateTime
from sqlmodel import Field, SQLModel

from app.utils import get_datetime_utc


class PDFExtractionBase(SQLModel):
    filename: str = Field(max_length=255)
    extracted_data: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    status: str = Field(default="success", max_length=50)


class PDFExtraction(PDFExtractionBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )


class PDFExtractionPublic(PDFExtractionBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime


class PDFExtractionsPublic(SQLModel):
    data: list[PDFExtractionPublic]
    count: int
