import logging
from sqlmodel import Session, select
from app.core.db import engine
from app.models_mobility import InternshipRequest

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_progress():
    with Session(engine) as session:
        internships = session.exec(select(InternshipRequest)).all()
        for i in internships:
            # Map progress to 8 steps
            i.current_step = max(1, round((i.progress / 100) * 8))
            session.add(i)
        session.commit()
        logger.info(f"Updated {len(internships)} internships to match progress and step.")

if __name__ == "__main__":
    fix_progress()
