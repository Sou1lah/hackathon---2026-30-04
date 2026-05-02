import uuid
from datetime import date
from sqlmodel import Session, create_engine, SQLModel
from app.core.config import settings
from app.crud_mobility import create_internship_request
from app.models_mobility import InternshipRequestCreate, InternshipStatus, VerificationStatus

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))

def test_create():
    with Session(engine) as session:
        # Get a real user ID
        from app.models import User
        from sqlmodel import select
        user = session.exec(select(User)).first()
        if not user:
            print("No user found")
            return
            
        request_in = InternshipRequestCreate(
            student_name="Test Student",
            registration_number="TEST123",
            mission_title="Test Mission",
            status=InternshipStatus.pending_verification,
            verification_status=VerificationStatus.verified,
            progress=15,
            current_step=2
        )
        try:
            res = create_internship_request(session=session, request_in=request_in, owner_id=user.id)
            print(f"Success: {res.id}")
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_create()
