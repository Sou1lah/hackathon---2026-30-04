import uuid
import datetime
from typing import Optional, List
from sqlmodel import Field, Relationship, SQLModel
from app.models import User
from app.models_mobility import InternshipRequest
from app.utils import get_datetime_utc

# ---------- ActivityLog ----------

class ActivityLogBase(SQLModel):
    title: str = Field(max_length=255)
    content: str = Field(max_length=2000)
    date: datetime.date = Field(default_factory=datetime.date.today)
    attachment_url: Optional[str] = Field(default=None, max_length=512)

class ActivityLogCreate(ActivityLogBase):
    internship_id: uuid.UUID

class TutorFeedbackBase(SQLModel):
    comment: str = Field(max_length=2000)
    rating: Optional[int] = Field(default=None, ge=1, le=5)

class TutorFeedbackCreate(TutorFeedbackBase):
    log_id: uuid.UUID

class TutorFeedbackPublic(TutorFeedbackBase):
    id: uuid.UUID
    log_id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime.datetime

class UserMinimal(SQLModel):
    id: uuid.UUID
    full_name: Optional[str] = None
    email: str

class ActivityLogPublic(ActivityLogBase):
    id: uuid.UUID
    internship_id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime.datetime
    feedback: List[TutorFeedbackPublic] = []
    owner: Optional[UserMinimal] = None

class ActivityLogsPublic(SQLModel):
    data: List[ActivityLogPublic]
    count: int

class ActivityLog(ActivityLogBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    internship_id: uuid.UUID = Field(
        foreign_key="internshiprequest.id", nullable=False, ondelete="CASCADE"
    )
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    created_at: datetime.datetime = Field(
        default_factory=get_datetime_utc,
    )
    
    owner: User = Relationship()
    internship: InternshipRequest = Relationship()
    feedback: List["TutorFeedback"] = Relationship(back_populates="log", cascade_delete=True)

# ---------- TutorFeedback ----------

class TutorFeedback(TutorFeedbackBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    log_id: uuid.UUID = Field(
        foreign_key="activitylog.id", nullable=False, ondelete="CASCADE"
    )
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    created_at: datetime.datetime = Field(
        default_factory=get_datetime_utc,
    )
    
    owner: User = Relationship()
    log: ActivityLog = Relationship(back_populates="feedback")
