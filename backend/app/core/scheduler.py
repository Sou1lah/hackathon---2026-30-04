import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlmodel import Session
from app.core.db import engine
from app.services.sync_offers import sync_internship_offers_to_db

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

async def scheduled_sync():
    """
    Job that runs the sync process.
    """
    logger.info("Running scheduled internship offers sync")
    with Session(engine) as session:
        try:
            await sync_internship_offers_to_db(session)
            logger.info("Scheduled sync completed successfully")
        except Exception as e:
            logger.error(f"Scheduled sync failed: {e}")

def start_scheduler():
    """
    Starts the background scheduler.
    """
    if not scheduler.running:
        # Run every 8 hours
        scheduler.add_job(
            scheduled_sync,
            trigger=IntervalTrigger(hours=8),
            id="sync_internship_offers",
            replace_existing=True
        )
        scheduler.start()
        logger.info("Background scheduler started (Sync every 8 hours)")

def shutdown_scheduler():
    """
    Shuts down the background scheduler.
    """
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Background scheduler shut down")
