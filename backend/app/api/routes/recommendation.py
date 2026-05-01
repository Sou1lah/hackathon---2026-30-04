from typing import Any
from fastapi import APIRouter, HTTPException
from sqlmodel import Session
from app.api.deps import SessionDep, CurrentUser
from app.models import UserPublic
from app.models_recommendation import StageRequest, StageRequestPublic, StageRequestCreate, RecommendationResponse
from app.services.recommendation import get_recommendations
from app.utils import get_datetime_utc

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.get("/me/profile", response_model=UserPublic)
def read_user_profile(current_user: CurrentUser) -> Any:
    """
    Get current user profile for display (read-only in UI).
    """
    return current_user

@router.post("/stage-request", response_model=RecommendationResponse)
def submit_stage_request(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    request_in: StageRequestCreate,
    debug: bool = False
) -> Any:
    """
    Submit a stage request and get ranked internship recommendations.
    """
    # 1. Save the request
    db_request = StageRequest.model_validate(
        request_in, update={"user_id": current_user.id, "submitted_at": get_datetime_utc()}
    )
    session.add(db_request)
    session.commit()
    session.refresh(db_request)
    
    # 2. Trigger recommendation engine
    recommendations = get_recommendations(session=session, user=current_user, request=db_request, debug=debug)
    
    # 3. Format and return results
    return recommendations
