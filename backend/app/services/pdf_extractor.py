"""
PDF data extractor service.

Reads raw text from uploaded PDFs and maps extracted tokens
to the fields that exist in the DB:
  User: full_name, specialty, level, language, gpa
  InternshipRequest: student_name, company_name, mission_title,
                     start_date, end_date, registration_number
  RecommendationForm: selected_interests, mobility_preference

Only values that match known enum lists / patterns are emitted —
everything else is discarded, so the caller receives a clean,
DB-safe payload.
"""

from __future__ import annotations

import re
import io
import logging
from typing import Any

logger = logging.getLogger(__name__)

# ── Canonical lookup tables (must stay in sync with models.py) ─────────────
SPECIALTY_MAP: dict[str, str] = {
    # French keywords → DB value
    "informatique": "Informatique",
    "computer science": "Informatique",
    "génie informatique": "Informatique",
    "genie informatique": "Informatique",
    "software engineering": "Informatique",
    "développement": "Informatique",
    "developpement": "Informatique",
    "management": "Management",
    "gestion": "Management",
    "business": "Management",
    "administration": "Management",
    "electronique": "Electronique",
    "électronique": "Electronique",
    "electronics": "Electronique",
    "génie électrique": "Electronique",
    "genie electrique": "Electronique",
    "mecanique": "Mecanique",
    "mécanique": "Mecanique",
    "mechanical": "Mecanique",
    "genie civil": "Genie Civil",
    "génie civil": "Genie Civil",
    "civil engineering": "Genie Civil",
    "biologie": "Biologie",
    "biology": "Biologie",
    "biotechnologie": "Biologie",
    "mathematiques": "Mathematiques",
    "mathématiques": "Mathematiques",
    "mathematics": "Mathematiques",
    "math": "Mathematiques",
    "physique": "Physique",
    "physics": "Physique",
    "chimie": "Chimie",
    "chemistry": "Chimie",
    "lettres": "Lettres et Langues",
    "langues": "Lettres et Langues",
    "languages": "Lettres et Langues",
    "droit": "Droit et Sciences Politiques",
    "sciences politiques": "Droit et Sciences Politiques",
    "political science": "Droit et Sciences Politiques",
    "sciences économiques": "Sciences Economiques",
    "sciences economiques": "Sciences Economiques",
    "economics": "Sciences Economiques",
    "économie": "Sciences Economiques",
    "médecine": "Medecine",
    "medecine": "Medecine",
    "medicine": "Medecine",
    "medical": "Medecine",
    "doctor": "Medecine",
    "docteur": "Medecine",
    "santé": "Medecine",
    "sante": "Medecine",
    "pharmacie": "Pharmacie",
    "pharmacy": "Pharmacie",
    "pharmacien": "Pharmacie",
    "chirurgie": "Medecine",
    "clinique": "Medecine",
    "hospital": "Medecine",
    "hôpital": "Medecine",
    "hopital": "Medecine",
    "architecture": "Architecture",
    "urbanisme": "Architecture",
    "design": "Architecture",
    "systèmes embarqués": "Electronique",
    "science des données": "Data Science",
    "statistiques": "Mathematiques",
    "économétrie": "Sciences Economiques",
    "gestion des ressources humaines": "Management",
    "rh": "Management",
    "hr": "Management",
    "finance": "Management",
    "comptabilité": "Management",
    "marketing": "Management",
}

LEVEL_PATTERNS: list[tuple[re.Pattern, str]] = [
    (re.compile(r"\bphd\b|\bdoctorat\b", re.I), "PhD"),
    (re.compile(r"\bm2\b|\bmaster\s*2\b|\bmaster\s*ii\b", re.I), "M2"),
    (re.compile(r"\bm1\b|\bmaster\s*1\b|\bmaster\s*i\b", re.I), "M1"),
    (re.compile(r"\bl3\b|\blicence\s*3\b|\blicense\s*3\b", re.I), "L3"),
    (re.compile(r"\bl2\b|\blicence\s*2\b", re.I), "L2"),
    (re.compile(r"\bl1\b|\blicence\s*1\b", re.I), "L1"),
]

LANGUAGE_MAP: dict[str, str] = {
    "arabic": "Arabic",
    "arabe": "Arabic",
    "français": "French",
    "francais": "French",
    "french": "French",
    "english": "English",
    "anglais": "English",
    "mixed": "Mixed (Arabic/French)",
    "bilingue": "Mixed (Arabic/French)",
}

INTEREST_KEYWORDS: dict[str, str] = {
    "artificial intelligence": "AI",
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "AI",
    " ia": "AI",
    "intelligence artificielle": "AI",
    "nlp": "AI",
    "computer vision": "AI",
    "data science": "Data Science",
    "science des données": "Data Science",
    "données": "Data Science",
    "big data": "Data Science",
    "data analyst": "Data Science",
    "logiciel": "Software Engineering",
    "software": "Software Engineering",
    "génie logiciel": "Software Engineering",
    "développement": "Software Engineering",
    "developpement": "Software Engineering",
    "programming": "Software Engineering",
    "web": "Web Development",
    "frontend": "Web Development",
    "backend": "Web Development",
    "fullstack": "Web Development",
    "react": "Web Development",
    "angular": "Web Development",
    "vue": "Web Development",
    "mobile": "Mobile Dev",
    "android": "Mobile Dev",
    "ios": "Mobile Dev",
    "flutter": "Mobile Dev",
    "react native": "Mobile Dev",
    "ui": "UI/UX Design",
    "ux": "UI/UX Design",
    "design": "UI/UX Design",
    "interface": "UI/UX Design",
    "figma": "UI/UX Design",
    "sécurité": "Cybersecurity",
    "securite": "Cybersecurity",
    "security": "Cybersecurity",
    "cybersécurité": "Cybersecurity",
    "cyber": "Cybersecurity",
    "pentest": "Cybersecurity",
    "cloud": "Cloud Computing",
    "aws": "Cloud Computing",
    "azure": "Cloud Computing",
    "gcp": "Cloud Computing",
    "docker": "Cloud Computing",
    "kubernetes": "Cloud Computing",
    "devops": "DevOps",
    "cicd": "DevOps",
    "jenkins": "DevOps",
    "systèmes embarqués": "Embedded Systems",
    "embarqué": "Embedded Systems",
    "embedded": "Embedded Systems",
    "arduino": "Embedded Systems",
    "raspberry": "Embedded Systems",
    "iot": "IoT",
    "internet of things": "IoT",
    "objets connectés": "IoT",
    "réseau": "Networking",
    "reseau": "Networking",
    "network": "Networking",
    "cisco": "Networking",
    "tcp/ip": "Networking",
    "médecine": "Medicine",
    "medecine": "Medicine",
    "medical": "Medicine",
    "santé": "Medicine",
    "sante": "Medicine",
    "pharmacie": "Pharmacy",
    "pharmacy": "Pharmacy",
    "biologie": "Biology",
    "biology": "Biology",
    "biotech": "Biology",
    "marketing": "Marketing",
    "publicité": "Marketing",
    "management": "Management",
    "gestion": "Management",
    "finance": "Finance",
    "comptabilité": "Finance",
    "banque": "Finance",
    "mécanique": "Mechanical Engineering",
    "mecanique": "Mechanical Engineering",
    "mechanical": "Mechanical Engineering",
    "électronique": "Electronics",
    "electronique": "Electronics",
    "electronics": "Electronics",
}

MOBILITY_PATTERNS: list[tuple[re.Pattern, str]] = [
    (re.compile(r"\binternational\b|\bétranger\b|\betranger\b|\bworldwide\b|\babroad\b", re.I), "international"),
    (re.compile(r"\bnational\b|\balgérie\b|\balgerie\b|\blocal\b", re.I), "national"),
]

GPA_RE = re.compile(
    r"(?:moyenne|gpa|note|grade|average|moy)[^\d\n]{0,20}(\d{1,2}[.,]\d{1,2})",
    re.I,
)
# Improved Name Regex: Stops at newline, handles multiple names, case insensitive flag for keywords
NAME_RE = re.compile(
    r"(?:nom\s+et\s+prénom|prénom\s+et\s+nom|name|nom|prénom|prenom|etudiant|student)[^\w\n]{0,10}[:\s]\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿa-zà-ÿ\-]*(?: +[A-ZÀ-Ÿ][A-ZÀ-Ÿa-zà-ÿ\-]*)+)",
    re.I,
)
COMPANY_RE = re.compile(
    r"(?:entreprise|company|société|societe|organisme|organization|host)[^\w\n]{0,10}([^\n]{3,80})",
    re.I,
)
MISSION_RE = re.compile(
    r"(?:mission|stage|internship|sujet|titre|title|subject)[^\w\n]{0,10}([^\n]{5,120})",
    re.I,
)
DATE_RE = re.compile(
    r"(?:du|from|début|debut|start|period start)[^\d\n]{0,15}(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
    re.I,
)
DATE_END_RE = re.compile(
    r"(?:au|to|fin|end|period end)[^\d\n]{0,15}(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
    re.I,
)
REG_RE = re.compile(
    r"(?:matricule|numéro d['\"]étudiant|registration|student\s*id|id)[^\w\n]{0,10}(\w{5,25})",
    re.I,
)


def _extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract raw text from a PDF byte stream using pypdf."""
    try:
        from pypdf import PdfReader  # type: ignore
        reader = PdfReader(io.BytesIO(pdf_bytes))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages)
    except Exception as e:
        logger.warning("pypdf extraction failed: %s", e)
        return ""


def _match_specialty(text: str) -> str | None:
    lower = text.lower()
    for kw, value in SPECIALTY_MAP.items():
        if kw in lower:
            return value
    return None


def _match_level(text: str) -> str | None:
    for pattern, level in LEVEL_PATTERNS:
        if pattern.search(text):
            return level
    return None


def _match_language(text: str) -> str | None:
    lower = text.lower()
    for kw, value in LANGUAGE_MAP.items():
        if kw in lower:
            return value
    return None


def _match_interests(text: str) -> list[str]:
    lower = text.lower()
    found: set[str] = set()
    for kw, tag in INTEREST_KEYWORDS.items():
        if kw in lower:
            found.add(tag)
    return sorted(found)


def _match_gpa(text: str) -> float | None:
    m = GPA_RE.search(text)
    if m:
        try:
            return float(m.group(1).replace(",", "."))
        except ValueError:
            pass
    return None


def _first_match(pattern: re.Pattern, text: str) -> str | None:
    m = pattern.search(text)
    return m.group(1).strip() if m else None


def extract_from_pdf(pdf_bytes: bytes) -> dict[str, Any]:
    """
    Extract structured data from a PDF and return only fields
    that match the DB schema. Unknown / unconfident values are omitted.

    Returns a dict with any subset of:
      full_name, specialty, level, language, gpa,
      student_name, company_name, mission_title,
      start_date, end_date, registration_number,
      selected_interests
    """
    text = _extract_text_from_pdf(pdf_bytes)
    if not text.strip():
        return {}

    result: dict[str, Any] = {}

    # ── User-level fields ───────────────────────────────────────────────────
    specialty = _match_specialty(text)
    if specialty:
        result["specialty"] = specialty

    level = _match_level(text)
    if level:
        result["level"] = level

    language = _match_language(text)
    if language:
        result["language"] = language

    gpa = _match_gpa(text)
    if gpa is not None and 0 < gpa <= 20:
        result["gpa"] = gpa

    # ── Mobility Preference ───────────────────────────────────────────────
    for pattern, pref in MOBILITY_PATTERNS:
        if pattern.search(text):
            result["mobility_preference"] = pref
            break

    name = _first_match(NAME_RE, text)
    if name:
        result["full_name"] = name
        result["student_name"] = name

    # ── InternshipRequest fields ────────────────────────────────────────────
    company = _first_match(COMPANY_RE, text)
    if company:
        result["company_name"] = company[:255]

    mission = _first_match(MISSION_RE, text)
    if mission:
        result["mission_title"] = mission[:255]

    start = _first_match(DATE_RE, text)
    if start:
        result["start_date"] = start

    end = _first_match(DATE_END_RE, text)
    if end:
        result["end_date"] = end

    reg = _first_match(REG_RE, text)
    if reg:
        result["registration_number"] = reg[:50]

    # ── Recommendation-form fields ──────────────────────────────────────────
    interests = _match_interests(text)
    if interests:
        result["selected_interests"] = interests

    return result
