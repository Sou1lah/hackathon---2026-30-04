import uuid
from typing import Any
from datetime import datetime, timezone
from sqlmodel import Session, select
from app.models import User, UserRole
from app.models_scraper import InternshipOffer
from app.models_recommendation import UserInteraction, StageRequest, Recommendation
from app.utils import get_datetime_utc

def build_user_profile(session: Session, user: User) -> User:
    """
    Infers user profile fields from login data and system rules.
    """
    # 1. Infer role_type and mobility_preference if not set
    if not user.role_type:
        if user.role in [UserRole.student_national, UserRole.student_international]:
            user.role_type = "student"
        elif user.role in [UserRole.prof_national, UserRole.prof_international]:
            user.role_type = "teacher"
        elif user.role == UserRole.admin:
            user.role_type = "admin"
    
    if not user.mobility_preference or user.mobility_preference == "national":
        if user.role in [UserRole.student_international, UserRole.prof_international]:
            user.mobility_preference = "international"
        elif user.role in [UserRole.student_national, UserRole.prof_national]:
            user.mobility_preference = "national"
        else:
            user.mobility_preference = "both"

    # 2. Update activity tracking
    user.last_login_at = get_datetime_utc()
    user.total_sessions += 1
    
    # 3. Initial interest tags (if empty, could infer from email or other data later)
    if not user.interest_tags:
        user.interest_tags = []

    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def match_internship_to_user(user: User, internship: InternshipOffer, request: StageRequest | None = None) -> float:
    """
    Calculates a match score (0-100) between a user and an internship offer.
    """
    score = 0.0
    
    # 1. Role match (Weight: 30)
    # Target audience can be "student", "teacher", or "both"
    if internship.target_audience == "both":
        score += 30
    elif user.role_type == internship.target_audience:
        score += 30
        
    # 2. Mobility match (Weight: 30)
    # Prioritize StageRequest if available
    target_mobility = request.selected_mobility_type if request else user.mobility_preference
    
    if target_mobility == "both":
        score += 30
    elif target_mobility == internship.mobility_type:
        score += 30
    elif not target_mobility and user.mobility_preference == internship.mobility_type:
        score += 30
        
    # 3. Keyword/Tag overlap (Weight: 30)
    # Combine User interests and Request interests
    user_tags = set(t.lower() for t in (user.interest_tags or []))
    if request and request.selected_interests:
        user_tags.update(set(i.lower() for i in request.selected_interests))
        
    if user_tags and internship.keywords:
        internship_keywords = set(k.lower() for k in internship.keywords)
        overlap = user_tags.intersection(internship_keywords)
        if overlap:
            # Scale score based on number of matches, cap at 30
            score += min(len(overlap) * 10, 30)
            
    # 4. Interaction history boost (Weight: 10)
    # This could be more complex, but for now we use engagement_score as a minor signal
    # or check if user has interacted with similar keywords before.
    if user.engagement_score > 0:
        score += min(user.engagement_score / 10, 10)
            
    return min(score, 100.0)

def get_recommendations(session: Session, user: User, request: StageRequest | None = None, limit: int = 20) -> list[dict[str, Any]]:
    """
    Fetches all internships, ranks them, and returns the top results.
    """
    # Fetch all internship offers
    statement = select(InternshipOffer)
    offers = session.exec(statement).all()
    
    results = []
    for offer in offers:
        score = match_internship_to_user(user, offer, request)
        results.append({
            "offer": offer,
            "score": score
        })
        
        # Optionally cache in Recommendation table
        rec = Recommendation(
            user_id=user.id,
            internship_id=offer.id,
            score=score
        )
        session.add(rec)
    
    # Sort by score descending
    results.sort(key=lambda x: x["score"], reverse=True)
    
    session.commit()
    return results[:limit]

def track_interaction(session: Session, user_id: uuid.UUID, offer_id: uuid.UUID, event_type: str):
    """
    Logs a user interaction event.
    """
    interaction = UserInteraction(
        user_id=user_id,
        offer_id=offer_id,
        event_type=event_type,
        created_at=get_datetime_utc()
    )
    session.add(interaction)
    
    # Optionally update engagement score
    user = session.get(User, user_id)
    if user:
        weight = {"view": 1, "click": 5, "save": 10}.get(event_type, 0)
        user.engagement_score += weight
        session.add(user)
        
    session.commit()
