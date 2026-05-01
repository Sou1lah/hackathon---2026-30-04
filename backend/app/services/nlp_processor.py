import logging
import httpx
import re

logger = logging.getLogger(__name__)

async def safe_translate(text: str) -> str | None:
    """
    Safely translates text to English using a free public endpoint.
    If it fails, it catches the exception and returns None, so the pipeline is not interrupted.
    """
    if not text:
        return None
        
    try:
        # Use a simple, free translation API (Google Translate web endpoint)
        url = "https://translate.googleapis.com/translate_a/single"
        params = {
            "client": "gtx",
            "sl": "auto",
            "tl": "en",
            "dt": "t",
            "q": text
        }
        async with httpx.AsyncClient() as client:
            # Short timeout to avoid blocking scraping for too long
            resp = await client.get(url, params=params, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                translated = "".join([part[0] for part in data[0] if part[0]])
                return translated
    except Exception as e:
        logger.warning(f"Translation failed, falling back to original text. Error: {e}")
        
    return None

def extract_structured_fields(text: str) -> dict:
    """
    Extracts structured data from the raw text (or translated text) using keywords.
    Never throws exceptions. If no match is found, returns None for that field.
    """
    fields = {
        "specialty": None,
        "required_level": None,
        "required_language": None,
        "gpa_requirement": None,
        "mobility_type": "national",
        "country": "Algeria",
        "country_flag": "🇩🇿",
        "country_code": "dz"
    }
    
    if not text:
        return fields
        
    try:
        text_lower = text.lower()
        
        # 1. Specialty Extraction
        specialties = [
            "computer science", "informatique", "software engineering",
            "data science", "machine learning", "artificial intelligence",
            "biology", "physics", "chemistry", "mathematics",
            "business", "marketing", "finance", "accounting",
            "engineering", "electrical", "mechanical", "civil"
        ]
        for spec in specialties:
            if spec in text_lower:
                fields["specialty"] = spec.title()
                break
                
        # 2. Required Level Extraction
        levels = ["bachelor", "master", "phd", "licence", "master 1", "master 2", "doctorat"]
        for level in levels:
            if level in text_lower:
                fields["required_level"] = level.title()
                break
                
        # 3. Required Language Extraction
        languages = ["english", "french", "arabic", "anglais", "français", "arabe"]
        for lang in languages:
            if lang in text_lower:
                fields["required_language"] = lang.title()
                break
                
        # 4. GPA Requirement Extraction
        gpa_match = re.search(r'(?:gpa|moyenne).*?([0-9]+[\.,][0-9]+)', text_lower)
        if gpa_match:
            try:
                fields["gpa_requirement"] = float(gpa_match.group(1).replace(',', '.'))
            except ValueError:
                pass

        # 5. Mobility & Country Extraction
        # (search_val, name, flag, code)
        countries = [
            ("france", "France", "🇫🇷", "fr"),
            ("spain", "Spain", "🇪🇸", "es"),
            ("espagne", "Spain", "🇪🇸", "es"),
            ("germany", "Germany", "🇩🇪", "de"),
            ("allemagne", "Germany", "🇩🇪", "de"),
            ("usa", "USA", "🇺🇸", "us"),
            ("united states", "USA", "🇺🇸", "us"),
            ("uk", "UK", "🇬🇧", "gb"),
            ("united kingdom", "UK", "🇬🇧", "gb"),
            ("canada", "Canada", "🇨🇦", "ca"),
            ("italy", "Italy", "🇮🇹", "it"),
            ("italie", "Italy", "🇮🇹", "it"),
            ("switzerland", "Switzerland", "🇨🇭", "ch"),
            ("suisse", "Switzerland", "🇨🇭", "ch"),
            ("belgium", "Belgium", "🇧🇪", "be"),
            ("belgique", "Belgium", "🇧🇪", "be"),
            ("netherlands", "Netherlands", "🇳🇱", "nl"),
            ("pays-bas", "Netherlands", "🇳🇱", "nl"),
            ("china", "China", "🇨🇳", "cn"),
            ("chine", "China", "🇨🇳", "cn"),
            ("japan", "Japan", "🇯🇵", "jp"),
            ("japon", "Japan", "🇯🇵", "jp"),
            ("india", "India", "🇮🇳", "in"),
            ("inde", "India", "🇮🇳", "in"),
            ("turkey", "Turkey", "🇹🇷", "tr"),
            ("turquie", "Turkey", "🇹🇷", "tr"),
            ("indonesia", "Indonesia", "🇮🇩", "id"),
            ("indonésie", "Indonesia", "🇮🇩", "id"),
            ("brazil", "Brazil", "🇧🇷", "br"),
            ("brésil", "Brazil", "🇧🇷", "br"),
            ("australia", "Australia", "🇦🇺", "au"),
            ("australie", "Australia", "🇦🇺", "au"),
        ]
        
        is_intl = False
        for search_val, name, flag, code in countries:
            if search_val in text_lower:
                fields["country"] = name
                fields["country_flag"] = flag
                fields["country_code"] = code
                fields["mobility_type"] = "international"
                is_intl = True
                break
        
        if not is_intl:
            if any(word in text_lower for word in ["algeria", "algérie", "alger", "oran", "annaba", "setif", "constantine"]):
                fields["country"] = "Algeria"
                fields["country_flag"] = "🇩🇿"
                fields["country_code"] = "dz"
                fields["mobility_type"] = "national"
            elif any(word in text_lower for word in ["international", "abroad", "étranger", "erasmus", "mobility"]):
                fields["mobility_type"] = "international"
                if fields["mobility_type"] == "international" and fields["country"] == "Algeria":
                   fields["country"] = "International"
                   fields["country_flag"] = "🌎"
                   fields["country_code"] = "un" # generic
                
    except Exception as e:
        logger.warning(f"Field extraction failed silently. Error: {e}")
        
    return fields
