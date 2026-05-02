
import re
from typing import Any

# Mocking logic
SPECIALTY_MAP: dict[str, str] = {
    "informatique": "Informatique",
    "médecine": "Medecine",
    "medecine": "Medecine",
    "medicine": "Medecine",
}

INTEREST_KEYWORDS: dict[str, str] = {
    "cloud": "Cloud",
    "electronic": "Networking",
}

def extract(text):
    result = {}
    lower = text.lower()
    for kw, val in SPECIALTY_MAP.items():
        if kw in lower:
            result["specialty"] = val
            break
    found_interests = []
    for kw, val in INTEREST_KEYWORDS.items():
        if kw in lower:
            found_interests.append(val)
    if found_interests:
        result["selected_interests"] = found_interests
    return result

def match(user_spec, user_interests, internship):
    score = 0.0
    breakdown = {"specialty": 0.0, "keywords": 0.0}
    search_text = f"{internship['title']} {internship.get('specialty', '')}".lower()
    
    # Specialty
    synonyms = {
        "Medecine": ["medical", "health", "doctor", "medicine"],
    }
    keywords = [user_spec.lower()] + [s.lower() for s in synonyms.get(user_spec, [])]
    for kw in keywords:
        if kw in search_text:
            breakdown["specialty"] = 35.0
            break
            
    # Interests
    for interest in user_interests:
        if interest.lower() in search_text:
            breakdown["keywords"] += 5.0
            
    score = breakdown["specialty"] + breakdown["keywords"]
    return score, breakdown

# Test scenario
cv_text = "I am a student of Medicine. Interested in Health tech."
extracted = extract(cv_text)
print(f"Extracted: {extracted}")

internships = [
    {"title": "Cloud Computing Internship", "specialty": "Informatique"},
    {"title": "Medical Resident", "specialty": "Medecine"},
]

user_spec = extracted.get("specialty", "Informatique")
user_interests = extracted.get("selected_interests", ["Cloud"]) # Mocking some persistent interests

for i in internships:
    s, b = match(user_spec, user_interests, i)
    print(f"Match with {i['title']}: Score={s}, Breakdown={b}")
