import sys
import os

# Add backend to path
sys.path.append("/home/wael/hackathon/backend")

from sqlmodel import SQLModel, create_engine
from app.core.config import settings

# Import all models to register them with SQLModel.metadata
from app.models import User, Item
from app.models_mobility import InternshipRequest, Convention, MobilityFile, ActivityLogEntry

def init_db():
    try:
        engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
        print(f"Connecting to {settings.POSTGRES_SERVER}...")
        SQLModel.metadata.create_all(engine)
        print("Successfully created/verified all tables.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    init_db()
