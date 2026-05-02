
import uuid
from typing import Any

# Mocking the logic from backend/app/services/recommendation.py

def match_internship_to_user(user: dict, internship: dict, request: dict = None) -> tuple[float, dict[str, float], list[str]]:
    score = 0.0
    breakdown = {
        "specialty": 0.0,
        "level": 0.0,
        "language": 0.0,
        "role": 0.0,
        "mobility": 0.0,
        "gpa_boost": 0.0
    }
    warnings = []
    
    search_text = f"{internship['title']} {internship.get('description', '')} {' '.join(internship.get('keywords', []))}".lower()
    
    # 1. Specialty Match (Weight: 40)
    target_specialty = (request.get("specialty") if request and request.get("specialty") else user.get("specialty"))
    if target_specialty:
        specialty = target_specialty.lower()
        synonyms = {
            "informatique": ["computer", "software", "tech", "it", "algorithm", "digital", "data", "programming"],
            "management": ["business", "administration", "leadership", "finance", "economics", "marketing"],
        }
        search_keywords = [specialty] + synonyms.get(specialty, [])
        
        match_found = False
        for kw in search_keywords:
            if kw in search_text:
                breakdown["specialty"] = 40.0
                match_found = True
                break
        
        if not match_found:
            words = specialty.split()
            matches = sum(1 for word in words if len(word) > 3 and word in search_text)
            if matches:
                breakdown["specialty"] = min(matches * 10.0, 30.0)
    
    score += breakdown["specialty"]

    # ... simplified for brevity ...
    
    return score, breakdown, warnings

def get_recommendations(user: dict, offers: list[dict], request: dict = None):
    results = []
    for offer in offers:
        score, breakdown, warnings = match_internship_to_user(user, offer, request)
        
        # CURRENT STRICT LOGIC:
        if breakdown["specialty"] == 0.0:
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

user_cs = {"specialty": "Informatique", "level": "M1", "language": "English"}
user_mgt = {"specialty": "Management", "level": "L3", "language": "French"}
user_unknown = {"specialty": "Unknown Specialty", "level": "M1", "language": "English"}

print("--- User CS ---")
recs = get_recommendations(user_cs, offers)
for r in recs: print(f"{r['offer']['title']}: {r['score']}")

print("\n--- User Unknown ---")
recs = get_recommendations(user_unknown, offers)
for r in recs: print(f"{r['offer']['title']}: {r['score']}")
