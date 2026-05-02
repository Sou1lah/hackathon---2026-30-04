
import uuid
from typing import Any

# Final logic from backend/app/services/recommendation.py

def match_internship_to_user(user: dict, internship: dict, request: dict = None) -> tuple[float, dict[str, float], list[str]]:
    score = 0.0
    breakdown = {"specialty": 0.0, "keywords": 0.0, "level": 0.0, "language": 0.0, "role": 0.0, "mobility": 0.0, "gpa_boost": 0.0}
    search_text = f"{internship['title']} {internship.get('description', '')} {' '.join(internship.get('keywords', []))}".lower()
    
    target_specialty = (request.get("specialty") if request and request.get("specialty") else user.get("specialty"))
    if target_specialty:
        specialty = target_specialty.lower()
        synonyms = {
            "informatique": ["computer", "software", "tech", "it", "algorithm", "digital", "data", "programming", "developer", "backend", "frontend", "web"],
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
    score += breakdown["specialty"]

    target_interests = (request.get("selected_interests") if request else user.get("interest_tags")) or []
    if target_interests:
        interest_matches = 0
        for interest in target_interests:
            if interest.lower() in search_text: interest_matches += 1
        if interest_matches: breakdown["keywords"] = min(interest_matches * 5.0, 15.0)
    score += breakdown["keywords"]

    # ... simplified ...
    return score, breakdown, []

def get_recommendations(user: dict, offers: list[dict], request: dict = None):
    results = []
    for offer in offers:
        score, breakdown, warnings = match_internship_to_user(user, offer, request)
        
        # LOOSENED LOGIC:
        if breakdown["specialty"] == 0.0 and breakdown["keywords"] < 5.0:
            continue
            
        results.append({"offer": offer, "score": score})
    results.sort(key=lambda x: x["score"], reverse=True)
    return results

# Test cases
offers = [
    {"title": "Software Engineer Intern", "description": "Work on python and django", "keywords": ["python", "web"]},
    {"title": "Marketing Assistant", "description": "Social media management", "keywords": ["marketing", "social"]},
    {"title": "Data Analyst", "description": "Analysis of big data using sql", "keywords": ["data", "sql"]},
]

user_unknown = {"specialty": "Unknown Specialty", "interest_tags": ["Python", "Web"]}

print("--- User Unknown but with Python/Web interests ---")
recs = get_recommendations(user_unknown, offers)
for r in recs: print(f"{r['offer']['title']}: {r['score']}")
