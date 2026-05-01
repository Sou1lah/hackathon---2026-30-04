import logging
from sqlmodel import Session, select
from app.models_scraper import InternshipOffer
from app.services.scraper import fetch_internship_offers
from app.services.nlp_processor import safe_translate, extract_structured_fields
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
        
        # NLP Processing (Non-blocking)
        # We combine title and description (if any) to have more text for extraction
        combined_text = offer_data["title"]
        if offer_data.get("description"):
            combined_text += " " + offer_data["description"]
            
        translated_text = await safe_translate(combined_text)
        
        # Extract structured fields
        text_for_extraction = translated_text if translated_text else combined_text
        structured_fields = extract_structured_fields(text_for_extraction)
        
        if existing_offer:
            # Update if title changed (or other fields)
            changed = False
            if existing_offer.title != offer_data["title"]:
                existing_offer.title = offer_data["title"]
                changed = True
            
            if offer_data["published_date"] and existing_offer.published_date != offer_data["published_date"]:
                existing_offer.published_date = offer_data["published_date"]
                changed = True
                
            # Update NLP fields if not set or if title/desc changed
            if translated_text and existing_offer.translated_description != translated_text:
                existing_offer.translated_description = translated_text
                changed = True
            
            for key, val in structured_fields.items():
                if val is not None and getattr(existing_offer, key) != val:
                    setattr(existing_offer, key, val)
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
                description=offer_data.get("description"),
                translated_description=translated_text,
                specialty=structured_fields.get("specialty"),
                required_level=structured_fields.get("required_level"),
                required_language=structured_fields.get("required_language"),
                gpa_requirement=structured_fields.get("gpa_requirement"),
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
