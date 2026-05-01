import uuid
from datetime import date, datetime
from enum import Enum
from typing import Optional, List

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel
from app.utils import get_datetime_utc

class PartnerType(str, Enum):
    university = "university"
    company = "company"

class PartnershipStatus(str, Enum):
    active = "active"
    expired = "expired"
    pending = "pending"

class PartnershipBase(SQLModel):
    partner_name: str = Field(max_length=255)
    partner_type: PartnerType = Field(default=PartnerType.company)
    contact_email: Optional[str] = Field(default=None, max_length=255)
    contact_phone: Optional[str] = Field(default=None, max_length=50)
    start_date: date
    end_date: date
    status: PartnershipStatus = Field(default=PartnershipStatus.active)
    document_url: Optional[str] = Field(default=None, max_length=512)

class PartnershipCreate(PartnershipBase):
    pass

class PartnershipUpdate(SQLModel):
    partner_name: Optional[str] = Field(default=None, max_length=255)
    partner_type: Optional[PartnerType] = None
    contact_email: Optional[str] = Field(default=None, max_length=255)
    contact_phone: Optional[str] = Field(default=None, max_length=50)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[PartnershipStatus] = None
    document_url: Optional[str] = Field(default=None, max_length=512)

class Partnership(PartnershipBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: Optional[datetime] = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )
    updated_at: Optional[datetime] = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )

class PartnershipPublic(PartnershipBase):
    id: uuid.UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class PartnershipsPublic(SQLModel):
    data: List[PartnershipPublic]
    count: int
