import uuid
from datetime import date, datetime, timezone
from enum import Enum

from sqlalchemy import DateTime
from sqlmodel import Column, Field, Relationship, SQLModel, String

from app.models import User, get_datetime_utc


# ---------- Enums ----------

class InternshipStatus(str, Enum):
    draft = "draft"
    pending_verification = "pending_verification"
    pending_signature = "pending_signature"
    active = "active"
    completed = "completed"
    blocked = "blocked"


class VerificationStatus(str, Enum):
    idle = "idle"
    checking = "checking"
    verified = "verified"
    failed = "failed"


class MobilityType(str, Enum):
    nationale = "nationale"
    internationale = "internationale"


class ApprovalLevel(str, Enum):
    N1 = "N1"
    N2 = "N2"
    N3 = "N3"


class Priority(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"
    critical = "Critical"


# ---------- InternshipRequest ----------

class InternshipRequestBase(SQLModel):
    student_name: str = Field(max_length=255)
    registration_number: str = Field(max_length=50)
    email: str | None = Field(default=None, max_length=255)
    birth_date: date | None = None
    company_name: str | None = Field(default=None, max_length=255)
    company_address: str | None = Field(default=None, max_length=500)
    mission_title: str | None = Field(default=None, max_length=255)
    mission_description: str | None = Field(default=None, max_length=2000)
    start_date: date | None = None
    end_date: date | None = None
    status: InternshipStatus = InternshipStatus.draft
    verification_status: VerificationStatus = VerificationStatus.idle
    progress: int = Field(default=0, ge=0, le=100)


class InternshipRequestCreate(InternshipRequestBase):
    pass


class InternshipRequestUpdate(SQLModel):
    student_name: str | None = Field(default=None, max_length=255)
    registration_number: str | None = Field(default=None, max_length=50)
    email: str | None = Field(default=None, max_length=255)
    birth_date: date | None = None
    company_name: str | None = Field(default=None, max_length=255)
    company_address: str | None = Field(default=None, max_length=500)
    mission_title: str | None = Field(default=None, max_length=255)
    mission_description: str | None = Field(default=None, max_length=2000)
    start_date: date | None = None
    end_date: date | None = None
    status: InternshipStatus | None = None
    verification_status: VerificationStatus | None = None
    progress: int | None = Field(default=None, ge=0, le=100)


class InternshipRequest(InternshipRequestBase, table=True):
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
    owner: User | None = Relationship()
    conventions: list["Convention"] = Relationship(
        back_populates="internship_request", cascade_delete=True
    )
    activity_logs: list["ActivityLogEntry"] = Relationship(
        back_populates="internship_request", cascade_delete=True
    )


class InternshipRequestPublic(InternshipRequestBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None


class InternshipRequestsPublic(SQLModel):
    data: list[InternshipRequestPublic]
    count: int


# ---------- Convention ----------

class ConventionBase(SQLModel):
    document_name: str = Field(max_length=255)
    signature_step: int = Field(default=1, ge=1, le=8)
    status: str = Field(default="pending", max_length=50)


class ConventionCreate(ConventionBase):
    internship_request_id: uuid.UUID


class ConventionUpdate(SQLModel):
    document_name: str | None = Field(default=None, max_length=255)
    signature_step: int | None = Field(default=None, ge=1, le=8)
    status: str | None = Field(default=None, max_length=50)


class Convention(ConventionBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    internship_request_id: uuid.UUID = Field(
        foreign_key="internshiprequest.id", nullable=False, ondelete="CASCADE"
    )
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
    owner: User | None = Relationship()
    internship_request: InternshipRequest | None = Relationship(
        back_populates="conventions"
    )


class ConventionPublic(ConventionBase):
    id: uuid.UUID
    internship_request_id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ConventionsPublic(SQLModel):
    data: list[ConventionPublic]
    count: int


# ---------- MobilityFile ----------

class MobilityFileBase(SQLModel):
    reference_code: str = Field(max_length=20)
    student_name: str = Field(max_length=255)
    destination: str = Field(max_length=500)
    mobility_type: MobilityType
    approval_level: ApprovalLevel = ApprovalLevel.N1
    priority: Priority = Priority.medium
    tags: str = Field(default="", max_length=500)  # Comma-separated
    status: str = Field(default="pending", max_length=50)


class MobilityFileCreate(MobilityFileBase):
    pass


class MobilityFileUpdate(SQLModel):
    reference_code: str | None = Field(default=None, max_length=20)
    student_name: str | None = Field(default=None, max_length=255)
    destination: str | None = Field(default=None, max_length=500)
    mobility_type: MobilityType | None = None
    approval_level: ApprovalLevel | None = None
    priority: Priority | None = None
    tags: str | None = Field(default=None, max_length=500)
    status: str | None = Field(default=None, max_length=50)


class MobilityFile(MobilityFileBase, table=True):
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
    owner: User | None = Relationship()


class MobilityFilePublic(MobilityFileBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None


class MobilityFilesPublic(SQLModel):
    data: list[MobilityFilePublic]
    count: int


# ---------- ActivityLogEntry ----------

class ActivityLogEntryBase(SQLModel):
    date: date
    content: str = Field(max_length=2000)
    hours: int = Field(ge=0, le=24)


class ActivityLogEntryCreate(ActivityLogEntryBase):
    internship_request_id: uuid.UUID


class ActivityLogEntry(ActivityLogEntryBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    internship_request_id: uuid.UUID = Field(
        foreign_key="internshiprequest.id", nullable=False, ondelete="CASCADE"
    )
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
    owner: User | None = Relationship()
    internship_request: InternshipRequest | None = Relationship(
        back_populates="activity_logs"
    )


class ActivityLogEntryPublic(ActivityLogEntryBase):
    id: uuid.UUID
    internship_request_id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime | None = None


class ActivityLogEntriesPublic(SQLModel):
    data: list[ActivityLogEntryPublic]
    count: int


# ---------- Dashboard Stats ----------

class DashboardStats(SQLModel):
    active_internships: int = 0
    pending_requests: int = 0
    validated_this_month: int = 0
    critical_alerts: int = 0
