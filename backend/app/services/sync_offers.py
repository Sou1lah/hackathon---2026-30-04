import logging
from sqlmodel import Session, select
from app.models_scraper import InternshipOffer
from app.services.scraper import fetch_internship_offers
from app.models import get_datetime_utc

logger = logging.getLogger(__name__)

async def sync_internship_offers_to_db(session: Session) -> dict:
    """
    Fetches offers from the website and syncs them to the database.
    """
    scraped_offers = await fetch_internship_offers()
    
    new_count = 0
    updated_count = 0
    
    now = get_datetime_utc()
    
    for offer_data in scraped_offers:
        # Check if offer exists by source_url
        statement = select(InternshipOffer).where(InternshipOffer.source_url == offer_data["source_url"])
        existing_offer = session.exec(statement).first()
        
        if existing_offer:
            # Update if title changed (or other fields)
            changed = False
            if existing_offer.title != offer_data["title"]:
                existing_offer.title = offer_data["title"]
                changed = True
            
            if offer_data["published_date"] and existing_offer.published_date != offer_data["published_date"]:
                existing_offer.published_date = offer_data["published_date"]
                changed = True
                
            if changed:
                existing_offer.updated_at = now
                session.add(existing_offer)
                updated_count += 1
        else:
            # Create new
            new_offer = InternshipOffer(
                title=offer_data["title"],
                source_url=offer_data["source_url"],
                published_date=offer_data["published_date"],
                description=offer_data["description"],
                created_at=now,
                updated_at=now
            )
            session.add(new_offer)
            new_count += 1
            
    session.commit()
    
    logger.info(f"Sync complete: {new_count} new, {updated_count} updated")
    return {
        "new": new_count,
        "updated": updated_count,
        "total_scraped": len(scraped_offers)
    }
