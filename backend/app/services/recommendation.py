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

def match_internship_to_user(user: User, internship: InternshipOffer, request: StageRequest | None = None) -> tuple[float, dict[str, float], list[str]]:
    """
    Calculates a match score (0-100) between a user and an internship offer.
    Returns (score, breakdown_dict, warnings_list)
    """
    score = 0.0
    breakdown = {
        "specialty": 0.0,
        "keywords": 0.0,
        "level": 0.0,
        "language": 0.0,
        "role": 0.0,
        "mobility": 0.0,
        "gpa_boost": 0.0
    }
    warnings = []
    
    search_text = f"{internship.title} {internship.description or ''} {' '.join(internship.keywords or [])} {internship.translated_description or ''} {internship.specialty or ''} {internship.required_level or ''} {internship.required_language or ''}".lower()
    
    # 1. Specialty Match (Weight: 35)
    target_specialty = (request.specialty if request and request.specialty else user.specialty)
    if target_specialty:
        specialty = target_specialty.lower()
        
        # Canonical synonym lookup (keys must match canonical values in lowercase)
        synonyms = {
            "informatique": ["computer", "software", "tech", "it", "algorithm", "digital", "data", "programming", "developer", "backend", "frontend", "web", "إعلام آلي", "تكنولوجيا", "حاسوب"],
            "management": ["business", "administration", "leadership", "finance", "economics", "marketing", "hr", "rh", "gestion", "تسيير", "إدارة"],
            "electronique": ["electrical", "circuit", "hardware", "power", "telecom", "embedded", "electronique", "électronique", "إلكترونيك", "كهرباء"],
            "mecanique": ["mechanical", "industrial", "robot", "engine", "mecanique", "mécanique", "ميكانيك", "هندسة"],
            "biologie": ["biology", "medical", "health", "science", "biotech", "biologie", "بيولوجيا", "طب"],
            "medecine": ["medical", "health", "doctor", "clinic", "hospital", "medicine", "medecine", "médecine", "طب", "صحة"],
            "lettres et langues": ["language", "literature", "translation", "english", "french", "arabic", "لغات", "أدب"],
            "sciences economiques": ["economics", "finance", "bank", "accounting", "economie", "اقتصاد", "مالية"],
            "droit et sciences politiques": ["law", "political", "legal", "rights", "politics", "حقوق", "قانون"],
            "architecture": ["design", "building", "urban", "construction", "architecture", "هندسة معمارية", "تصميم"]
        }
        
        search_keywords = [specialty] + synonyms.get(specialty, [])
        
        match_found = False
        for kw in search_keywords:
            if kw in search_text:
                breakdown["specialty"] = 35.0
                match_found = True
                break
        
        if not match_found:
            words = specialty.split()
            matches = sum(1 for word in words if len(word) > 3 and word in search_text)
            if matches:
                breakdown["specialty"] = min(matches * 8.0, 25.0)
    else:
        warnings.append("User/Request is missing 'specialty'")
        
    score += breakdown["specialty"]

    # --- DOMAIN FILTERING (Safety Logic) ---
    # Define broad domains to avoid noise (e.g. Health vs Tech)
    DOMAINS = {
        "Tech": ["informatique", "electronique", "data science"],
        "Health": ["medecine", "pharmacie", "biologie"],
        "Engineering": ["mecanique", "genie civil"],
        "Business": ["management", "sciences economiques"],
        "Legal": ["droit et sciences politiques"],
        "Humanities": ["lettres et langues"],
    }
    
    def get_domain(spec):
        if not spec: return None
        s = spec.lower()
        for d, specs in DOMAINS.items():
            if s in specs: return d
        return None

    user_domain = get_domain(target_specialty)
    offer_domain = get_domain(internship.specialty)
    
    # If both have clear domains and they differ, apply a heavy penalty (unless high keyword match)
    if user_domain and offer_domain and user_domain != offer_domain:
        if breakdown["specialty"] < 30.0: # If it's not a strong explicit match
            score *= 0.1 # Heavily suppress cross-domain noise
            warnings.append(f"Cross-domain detected: {user_domain} vs {offer_domain}")

    # 2. Keyword/Interest Match (Weight: 15)
    target_interests = (request.selected_interests if request else user.interest_tags) or []
    if target_interests:
        interest_matches = 0
        for interest in target_interests:
            if interest.lower() in search_text:
                interest_matches += 1
        
        if interest_matches:
            breakdown["keywords"] = min(interest_matches * 5.0, 15.0)
    
    score += breakdown["keywords"]

    # 3. Level Match (Weight: 10)
    target_level = (request.level if request and request.level else user.level)
    if target_level:
        level = target_level.lower()
        if level in search_text:
            breakdown["level"] = 10.0
    else:
        warnings.append("User/Request is missing 'level'")
        
    score += breakdown["level"]

    # 4. Language Match (Weight: 10)
    target_language = (request.language if request and request.language else user.language)
    if target_language:
        language = target_language.lower()
        if language in search_text:
            breakdown["language"] = 10.0
    else:
        warnings.append("User/Request is missing 'language'")
        
    score += breakdown["language"]

    # 5. Role match (Weight: 15)
    if internship.target_audience == "both":
        breakdown["role"] = 15.0
    elif user.role_type == internship.target_audience:
        breakdown["role"] = 15.0
    else:
        warnings.append(f"Role mismatch: user is {user.role_type}, internship wants {internship.target_audience}")
        
    score += breakdown["role"]
        
    # 6. Mobility match (Weight: 10)
    target_mobility = request.selected_mobility_type if request else user.mobility_preference
    if target_mobility == "both":
        breakdown["mobility"] = 10.0
    elif target_mobility == internship.mobility_type:
        breakdown["mobility"] = 10.0
    else:
        warnings.append(f"Mobility mismatch: user prefers {target_mobility}, internship is {internship.mobility_type}")
        
    score += breakdown["mobility"]
        
    # 7. GPA Boost (Weight: 5)
    target_gpa = (request.gpa if request and request.gpa is not None else user.gpa)
    if target_gpa and target_gpa > 10: # Assuming 0-20 scale
        breakdown["gpa_boost"] = min((target_gpa - 10) * 0.5, 5.0)
            
    score += breakdown["gpa_boost"]
            
    final_score = min(score, 100.0)
    return final_score, breakdown, warnings

def get_recommendations(session: Session, user: User, request: StageRequest | None = None, limit: int = 20, debug: bool = False) -> dict[str, Any]:
    """
    Fetches all internships, ranks them, and returns the top results.
    Includes fallback logic if no strong matches are found.
    """
    statement = select(InternshipOffer)
    offers = session.exec(statement).all()
    
    results = []
    for offer in offers:
        score, breakdown, warnings = match_internship_to_user(user, offer, request)
        
        # LOOSENED: Enforce at least some domain relevance (specialty OR high keyword match)
        if breakdown["specialty"] == 0.0 and breakdown["keywords"] < 5.0:
            continue
            
        result_item = {
            "offer": offer,
            "score": score
        }
        
        if debug:
            result_item["breakdown"] = breakdown
            result_item["warnings"] = warnings
            
        results.append(result_item)
        
        # PREVENT DUPLICATION: Check for existing recommendation
        rec_statement = select(Recommendation).where(
            Recommendation.user_id == user.id,
            Recommendation.internship_id == offer.id
        )
        existing_rec = session.exec(rec_statement).first()
        
        if existing_rec:
            existing_rec.score = score
            existing_rec.created_at = get_datetime_utc()
            session.add(existing_rec)
        else:
            rec = Recommendation(
                user_id=user.id,
                internship_id=offer.id,
                score=score
            )
            session.add(rec)
    
    # Sort by score descending
    results.sort(key=lambda x: x["score"], reverse=True)
    
    session.commit()
    
    if results:
        return {
            "results": results if debug else results[:limit],
            "is_fallback": False,
            "message": None
        }
    else:
        # Fallback: if still nothing, return top generic offers
        fallback_offers = sorted(offers, key=lambda x: x.published_date or datetime.min.date(), reverse=True)[:5]
        return {
            "results": [{"offer": o, "score": 10.0} for o in fallback_offers],
            "is_fallback": True,
            "message": "No specific matches found. Here are some recent opportunities that might interest you."
        }

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
