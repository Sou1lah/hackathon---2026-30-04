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
    
    # 1. Specialty Match (Weight: 40)
    # Prioritize specialty from request, then fallback to user profile
    target_specialty = (request.specialty if request and request.specialty else user.specialty)
    if target_specialty:
        specialty = target_specialty.lower()
        search_text = f"{internship.title} {internship.description or ''} {' '.join(internship.keywords or [])}".lower()
        if specialty in search_text:
            score += 40
        else:
            # Partial match for multi-word specialties
            words = specialty.split()
            matches = sum(1 for word in words if len(word) > 3 and word in search_text)
            if matches:
                score += min(matches * 10, 30)

    # 2. Level Match (Weight: 15)
    target_level = (request.level if request and request.level else user.level)
    if target_level:
        level = target_level.lower()
        search_text = f"{internship.title} {internship.description or ''} {' '.join(internship.keywords or [])}".lower()
        if level in search_text:
            score += 15

    # 3. Language Match (Weight: 15)
    target_language = (request.language if request and request.language else user.language)
    if target_language:
        language = target_language.lower()
        search_text = f"{internship.title} {internship.description or ''} {' '.join(internship.keywords or [])}".lower()
        if language in search_text:
            score += 15

    # 4. Role match (Weight: 15)
    if internship.target_audience == "both":
        score += 15
    elif user.role_type == internship.target_audience:
        score += 15
        
    # 5. Mobility match (Weight: 15)
    target_mobility = request.selected_mobility_type if request else user.mobility_preference
    if target_mobility == "both":
        score += 15
    elif target_mobility == internship.mobility_type:
        score += 15
        
    # 6. GPA Boost (Weight: 5)
    target_gpa = (request.gpa if request and request.gpa is not None else user.gpa)
    if target_gpa and target_gpa > 10: # Assuming 0-20 scale or similar
        score += min((target_gpa - 10) * 0.5, 5)
            
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
