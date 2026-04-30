"""
Database connection and session management
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import os

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:hackathon123@localhost:5433/hackathon")

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={} if "localhost" in DATABASE_URL else {"sslmode": "require"}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_all():
    """Create all tables"""
    from backend.app.models import Base
    Base.metadata.create_all(bind=engine)
