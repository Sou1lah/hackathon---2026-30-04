from typing import Any
from fastapi import APIRouter, HTTPException, BackgroundTasks
from sqlmodel import select, func, Session
from app.core.db import engine

from app.models_scraper import InternshipOffer, InternshipOfferBase, InternshipOffersPublic, InternshipOfferPublic
from app.services.sync_offers import sync_internship_offers_to_db
from app.services.recommendation import track_interaction, get_recommendations
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

@router.post("/", response_model=InternshipOfferPublic)
def create_offer(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    offer_in: InternshipOfferBase,
) -> Any:
    """
    Manually create an internship offer (admin only).
    """
    if not (current_user.is_superuser or current_user.can_review_applications):
        raise HTTPException(status_code=403, detail="Not authorized")

    # source_url must be unique – generate a synthetic one if blank
    if not offer_in.source_url:
        raise HTTPException(status_code=422, detail="source_url is required")

    offer = InternshipOffer.model_validate(offer_in)
    session.add(offer)
    try:
        session.commit()
    except Exception:
        session.rollback()
        raise HTTPException(status_code=409, detail="An offer with this source URL already exists.")
    session.refresh(offer)
    return offer


@router.get("/recommended", response_model=list[dict[str, Any]])
def read_recommended_offers(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    limit: int = 20
) -> Any:
    """
    Retrieve recommended internship offers for the current user.
    """
    return get_recommendations(session=session, user=current_user, limit=limit)

@router.get("/{id}", response_model=InternshipOfferPublic)
def read_offer(session: SessionDep, id: str) -> Any:
    """
    Get a specific internship offer by ID.
    """
    offer = session.get(InternshipOffer, id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return offer

@router.put("/{id}", response_model=InternshipOfferPublic)
def update_offer(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: str,
    offer_in: InternshipOfferBase,
) -> Any:
    """
    Update an internship offer (admin only).
    """
    if not (current_user.is_superuser or current_user.can_review_applications):
        raise HTTPException(status_code=403, detail="Not authorized")
    offer = session.get(InternshipOffer, id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    update_data = offer_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(offer, key, value)
    session.add(offer)
    try:
        session.commit()
    except Exception:
        session.rollback()
        raise HTTPException(status_code=409, detail="Update failed — possible duplicate source URL.")
    session.refresh(offer)
    return offer


@router.delete("/{id}", response_model=dict)
def delete_offer(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: str,
) -> Any:
    """
    Delete an internship offer (admin only).
    """
    if not (current_user.is_superuser or current_user.can_review_applications):
        raise HTTPException(status_code=403, detail="Not authorized")
    offer = session.get(InternshipOffer, id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    session.delete(offer)
    session.commit()
    return {"status": "deleted", "id": id}


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
