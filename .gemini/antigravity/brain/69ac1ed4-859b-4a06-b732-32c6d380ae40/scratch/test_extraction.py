
import re
from typing import Any

# Copying current logic from backend/app/services/pdf_extractor.py to test it
SPECIALTY_MAP: dict[str, str] = {
    "informatique": "Informatique",
    "computer science": "Informatique",
    "génie informatique": "Informatique",
    "management": "Management",
    "gestion": "Management",
    "electronique": "Electronique",
    "électronique": "Electronique",
    "mecanique": "Mecanique",
    "mécanique": "Mecanique",
    "genie civil": "Genie Civil",
    "génie civil": "Genie Civil",
    "biologie": "Biologie",
    "mathématiques": "Mathematiques",
    "physique": "Physique",
    "chimie": "Chimie",
}

GPA_RE = re.compile(r"(?:moyenne|gpa|note|grade|average|moy)[^\d]{0,15}(\d{1,2}[.,]\d{1,2})", re.I)
NAME_RE = re.compile(r"(?:nom|name|prénom|prenom|etudiant|student)[^\w\n]{0,10}([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s[A-ZÀ-Ÿ][a-zà-ÿ]+)+)", re.I)
COMPANY_RE = re.compile(r"(?:entreprise|company|société|societe|organisme|organization)[^\w\n]{0,10}([^\n]{3,80})", re.I)
DATE_RE = re.compile(r"(?:du|from|début|debut|start)[^\d]{0,10}(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})", re.I)

def test_extract(text):
    result = {}
    
    # Specialty
    lower = text.lower()
    for kw, value in SPECIALTY_MAP.items():
        if kw in lower:
            result["specialty"] = value
            break
            
    # GPA
    m = GPA_RE.search(text)
    if m:
        result["gpa"] = m.group(1).replace(",", ".")
        
    # Name
    m = NAME_RE.search(text)
    if m:
        result["name"] = m.group(1).strip()
        
    # Company
    m = COMPANY_RE.search(text)
    if m:
        result["company"] = m.group(1).strip()
        
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
