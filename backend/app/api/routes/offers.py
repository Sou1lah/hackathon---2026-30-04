from typing import Any
from fastapi import APIRouter, HTTPException, BackgroundTasks
from sqlmodel import select, func, Session
from app.core.db import engine

from app.models_scraper import InternshipOffer, InternshipOffersPublic, InternshipOfferPublic
from app.services.sync_offers import sync_internship_offers_to_db
from app.services.recommendation import track_interaction
from app.api.deps import SessionDep, CurrentUser

router = APIRouter(prefix="/internships", tags=["internships"])

async def background_sync():
    with Session(engine) as session:
        try:
            await sync_internship_offers_to_db(session)
        except Exception as e:
            print(f"Background sync failed: {e}")

@router.get("/refresh", response_model=dict)
async def refresh_offers(background_tasks: BackgroundTasks) -> Any:
    """
    Triggers scraping and DB sync for internship offers in the background.
    """
    try:
        background_tasks.add_task(background_sync)
        return {
            "status": "success",
            "message": "Scraping and sync started in the background",
            "data": None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed to start: {str(e)}")

@router.get("/", response_model=InternshipOffersPublic)
def read_offers(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve stored internship offers.
    """
    count_statement = select(func.count()).select_from(InternshipOffer)
    count = session.exec(count_statement).one()
    
    statement = select(InternshipOffer).offset(skip).limit(limit).order_by(InternshipOffer.published_date.desc())
    offers = session.exec(statement).all()
    
    return InternshipOffersPublic(data=offers, count=count)

@router.get("/{id}", response_model=InternshipOfferPublic)
def read_offer(session: SessionDep, id: str) -> Any:
    """
    Get a specific internship offer by ID.
    """
    offer = session.get(InternshipOffer, id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return offer

@router.post("/{id}/track", response_model=dict)
def log_interaction(
    *,
    session: SessionDep,
    id: str,
    current_user: CurrentUser,
    event_type: str  # view, click, save
) -> Any:
    """
    Log a user interaction (view, click, save) for an internship offer.
    """
    offer = session.get(InternshipOffer, id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    track_interaction(
        session=session,
        user_id=current_user.id,
        offer_id=offer.id,
        event_type=event_type
    )
    
    return {"status": "success", "event": event_type}
