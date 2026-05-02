import uuid
from sqlmodel import Session, create_engine, select
from app.models_mobility import Convention, InternshipRequest
from app.core.config import settings

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))

with Session(engine) as session:
    conventions = session.exec(select(Convention)).all()
    print(f"Total conventions: {len(conventions)}")
    for c in conventions:
        print(f"ID: {c.id}, Owner: {c.owner_id}, Status: {c.status}, Step: {c.signature_step}")
    
    requests = session.exec(select(InternshipRequest)).all()
    print(f"\nTotal requests: {len(requests)}")
    for r in requests:
        print(f"ID: {r.id}, Owner: {r.owner_id}, Status: {r.status}")
