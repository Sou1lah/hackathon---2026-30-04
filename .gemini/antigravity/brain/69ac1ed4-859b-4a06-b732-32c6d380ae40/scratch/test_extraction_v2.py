
import re
from typing import Any

# Updated logic from backend/app/services/pdf_extractor.py
SPECIALTY_MAP: dict[str, str] = {
    "informatique": "Informatique",
    "computer science": "Informatique",
    "génie informatique": "Informatique",
    "software engineering": "Informatique",
}

NAME_RE = re.compile(
    r"(?:nom(?:\s+et\s+prénom)?|name|prénom|prenom|etudiant|student)[^\w\n]{0,15}([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)+)",
    re.I,
)

def test_extract(text):
    result = {}
    
    # Specialty
    lower = text.lower()
    for kw, value in SPECIALTY_MAP.items():
        if kw in lower:
            result["specialty"] = value
            break
            
    # Name
    m = NAME_RE.search(text)
    if m:
        result["name"] = m.group(1).strip()
        
    return result

sample_texts = [
    "Nom: DOE John\nMoyenne: 15.5\nSpécialité: Informatique",
    "Student Name: Alice Smith\nGPA: 3.8\nCompany: Google\nStart Date: 01/06/2026",
    "Prénom et Nom: Mohammed ALGERI\nNote: 14,25\nEntreprise: Sonatrach",
    "CURRICULUM VITAE\nJohn Smith\nComputer Science student\nGPA 16.0",
]

for i, text in enumerate(sample_texts):
    print(f"--- Test {i+1} ---")
    print(f"Input: {text.replace('\\n', ' ')}")
    print(f"Output: {test_extract(text)}")
