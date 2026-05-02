
import re
from typing import Any

# Updated logic from backend/app/services/pdf_extractor.py
NAME_RE = re.compile(
    r"(?:nom(?:\s+et\s+prénom)?|name|prénom|prenom|etudiant|student)[^\w\n]{0,15}([A-ZÀ-Ÿ][a-zà-ÿ]+(?: +[A-ZÀ-Ÿ][a-zà-ÿ]+)+)",
    re.I,
)

def test_extract(text):
    result = {}
    # Name
    m = NAME_RE.search(text)
    if m:
        result["name"] = m.group(1).strip()
    return result

sample_texts = [
    "Nom: DOE John\nMoyenne: 15.5",
    "Student Name: Alice Smith\nGPA: 3.8",
    "Prénom et Nom: Mohammed ALGERI\nNote: 14,25",
]

for i, text in enumerate(sample_texts):
    print(f"--- Test {i+1} ---")
    print(f"Input: {text.replace('\\n', ' ')}")
    print(f"Output: {test_extract(text)}")
