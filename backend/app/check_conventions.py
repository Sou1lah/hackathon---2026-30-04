from sqlmodel import Session, create_engine, select
from app.models_mobility import Convention, ApprovalLevel
from app.core.config import settings

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))

with Session(engine) as session:
    conventions = session.exec(select(Convention)).all()
    print(f"Total conventions: {len(conventions)}")
    for c in conventions:
        print(f"ID: {c.id}, Level: {c.approval_level}, Status: {c.status}")
