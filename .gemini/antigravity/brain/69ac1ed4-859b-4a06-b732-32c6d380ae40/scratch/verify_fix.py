
import re
from typing import Any

# Updated Mock Logic
DOMAINS = {
    "Tech": ["informatique", "electronique"],
    "Health": ["medecine", "pharmacie", "biologie"],
}

def get_domain(spec):
    if not spec: return None
    s = spec.lower()
    for d, specs in DOMAINS.items():
        if s in specs: return d
    return None

def match(user_spec, user_interests, internship):
    score = 0.0
    breakdown = {"specialty": 0.0, "keywords": 0.0}
    search_text = f"{internship['title']} {internship.get('specialty', '')}".lower()
    
    # Specialty (Corrected keys)
    synonyms = {
        "medecine": ["medical", "health", "doctor", "medicine"],
    }
    spec_key = user_spec.lower()
    keywords = [spec_key] + [s.lower() for s in synonyms.get(spec_key, [])]
    for kw in keywords:
        if kw in search_text:
            breakdown["specialty"] = 35.0
            break
            
    # Interests
    for interest in user_interests:
        if interest.lower() in search_text:
            breakdown["keywords"] += 5.0
            
    score = breakdown["specialty"] + breakdown["keywords"]
    
    # Domain Filtering
    user_domain = get_domain(user_spec)
    offer_domain = get_domain(internship.get('specialty'))
    if user_domain and offer_domain and user_domain != offer_domain:
        if breakdown["specialty"] < 30.0:
            score *= 0.1
            
    return score, breakdown

# Test scenario
internships = [
    {"title": "Cloud Computing Internship", "specialty": "Informatique"},
    {"title": "Medical Resident", "specialty": "Medecine"},
]

user_spec = "Medecine"
user_interests = ["Cloud"] # Persistent noise interest

print(f"User: {user_spec}, Interests: {user_interests}")
for i in internships:
    s, b = match(user_spec, user_interests, i)
    print(f"Match with {i['title']}: Score={s}, Breakdown={b}")
