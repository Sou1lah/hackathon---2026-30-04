import sys
import os

# Add backend to path
sys.path.append("/home/wael/hackathon/backend")

from app.crud_mobility import get_dashboard_stats
from sqlmodel import Session, create_url, create_engine
from app.core.config import settings

def test_stats():
    try:
        engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
        with Session(engine) as session:
            stats = get_dashboard_stats(session=session)
            print(f"Stats: {stats}")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_stats()
