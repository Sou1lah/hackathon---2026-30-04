import logging
import uuid
import random
from datetime import datetime, timedelta, timezone
from sqlmodel import Session, select
from app.core.db import engine
from app.models import User
from app.models_mobility import InternshipRequest, InternshipStatus, VerificationStatus
from app.models_suivi import ActivityLog, TutorFeedback

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_mock_data():
    with Session(engine) as session:
        # Get users to attach internships to
        users = session.exec(select(User).where(User.is_superuser == False)).all()
        
        if not users:
            logger.info("No non-admin users found. Creating fake users...")
            for i in range(3):
                user = User(
                    email=f"student{i}@example.com",
                    full_name=f"Student {i}",
                    hashed_password="mock",
                    is_active=True
                )
                session.add(user)
            session.commit()
            users = session.exec(select(User).where(User.is_superuser == False)).all()

        logger.info(f"Seeding internships for {len(users)} users...")

        statuses = [InternshipStatus.active, InternshipStatus.completed, InternshipStatus.active]
        
        for i, user in enumerate(users):
            # Check if user already has an internship
            internship = session.exec(select(InternshipRequest).where(InternshipRequest.owner_id == user.id)).first()
            
            if not internship:
                status = statuses[i % len(statuses)]
                internship = InternshipRequest(
                    student_name=user.full_name or f"Student {user.email}",
                    registration_number=f"REG-{10000+i}",
                    email=user.email,
                    company_name=f"Tech Corp {i}",
                    mission_title=f"Software Engineering Intern {i}",
                    mission_description="Working on full-stack web applications and AI integration.",
                    start_date=datetime.now(timezone.utc).date() - timedelta(days=30),
                    end_date=datetime.now(timezone.utc).date() + timedelta(days=60),
                    status=status,
                    verification_status=VerificationStatus.verified,
                    progress=random.randint(10, 100) if status == InternshipStatus.active else 100,
                    owner_id=user.id
                )
                session.add(internship)
                session.commit()
                session.refresh(internship)
                logger.info(f"Created {status} internship for user {user.email}")
            else:
                if internship.status not in [InternshipStatus.active, InternshipStatus.completed]:
                    internship.status = InternshipStatus.active
                    session.add(internship)
                    session.commit()
                logger.info(f"User {user.email} already has an internship: {internship.status}")

            # Now add some activity logs to `models_suivi.ActivityLog`
            existing_logs = session.exec(select(ActivityLog).where(ActivityLog.internship_id == internship.id)).all()
            if not existing_logs:
                for j in range(3):
                    date = datetime.now(timezone.utc).date() - timedelta(days=j*7)
                    log = ActivityLog(
                        title=f"Weekly Report #{3-j}",
                        content=f"This week I focused on building the frontend components for the dashboard and integrated the new API endpoints. Everything went smoothly. (Report {3-j})",
                        date=date,
                        internship_id=internship.id,
                        owner_id=user.id
                    )
                    session.add(log)
                    session.commit()
                    session.refresh(log)
                    
                    # Add feedback occasionally
                    if j % 2 == 0:
                        feedback = TutorFeedback(
                            comment="Great progress this week! Keep up the good work and make sure to add unit tests.",
                            rating=4,
                            log_id=log.id,
                            owner_id=user.id # Just simulating someone gave feedback
                        )
                        session.add(feedback)
                        session.commit()
                        
                logger.info(f"Added 3 activity logs for internship {internship.id}")
            else:
                logger.info(f"Internship {internship.id} already has {len(existing_logs)} logs.")

        logger.info("Database seeded successfully!")

if __name__ == "__main__":
    generate_mock_data()
