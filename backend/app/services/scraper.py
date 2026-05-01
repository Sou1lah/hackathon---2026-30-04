import logging
from datetime import date
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

MONTHS_AR = {
    "يناير": 1,
    "فبراير": 2,
    "مارس": 3,
    "أبريل": 4,
    "مايو": 5,
    "يونيو": 6,
    "يوليو": 7,
    "أغسطس": 8,
    "سبتمبر": 9,
    "أكتوبر": 10,
    "نوفمبر": 11,
    "ديسمبر": 12,
}

def parse_arabic_date(date_str: str) -> date | None:
    """
    Parses Arabic date string like 'أبريل 29, 2026' or '29 أبريل 2026'.
    Handles cases where multiple dates might be joined (e.g. created and updated).
    """
    if not date_str:
        return None
    
    try:
        # Clean up the string
        # Some strings might have joined dates like "أبريل 29, 2026أبريل 30, 2026"
        # We try to take the first valid-looking date part.
        
        # Replace common separators with spaces for easier splitting
        clean_str = date_str.replace(",", " ").replace("\xa0", " ").strip()
        parts = clean_str.split()
        
        day = None
        month = None
        year = None
        
        # Look for day (number), month (from dict), and year (4-digit number)
        for part in parts:
            if part.isdigit():
                val = int(part)
                if 1 <= val <= 31 and day is None:
                    day = val
                elif 2000 <= val <= 2100 and year is None:
                    year = val
            elif part in MONTHS_AR:
                month = MONTHS_AR[part]
        
        # If we have all components, return date
        if day and month and year:
            return date(year, month, day)
        
        # Fallback for "أبريل 29, 2026" format if parts loop failed
        # (Though parts loop should catch it)
        return None
    except Exception as e:
        logger.warning(f"Failed to parse Arabic date '{date_str}': {e}")
        return None

async def fetch_internship_offers() -> list[dict]:
    """
    Scrapes internship offers from the university website.
    """
    base_url = "https://www.univ-annaba.dz/ar/%D8%A7%D9%84%D8%AA%D8%B9%D8%A7%D9%88%D9%86/%D8%B9%D8%B1%D9%88%D8%B6-%D9%85%D9%86%D8%AD-%D8%A7%D9%84%D8%AA%D8%B9%D8%A7%D9%88%D9%86/"
    offers = []
    
    async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
        # We'll scrape first 3 pages to start with (can be adjusted)
        for page in range(1, 4):
            url = base_url if page == 1 else f"{base_url}page/{page}/"
            logger.info(f"Scraping page {page}: {url}")
            
            try:
                response = await client.get(url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, "html.parser")
                
                # Based on the structure observed in markdown:
                # Offers are usually in articles or specific containers.
                # WordPress often uses <article> or divs with specific classes.
                # In the markdown, they appeared as ##### headings.
                
                # Let's find all h5 elements (or similar) that contain links
                headings = soup.find_all(["h1", "h2", "h3", "h4", "h5"])
                
                for h in headings:
                    link_tag = h.find("a")
                    if not link_tag or not link_tag.get("href"):
                        continue
                    
                    href = link_tag["href"]
                    # Filter for links that seem like individual posts (avoid category links etc.)
                    if "/ar/" not in href or href == base_url or "page/" in href:
                        continue
                        
                    title = link_tag.get_text(strip=True)
                    if not title:
                        continue
                        
                    # Find date - usually in a sibling or parent container
                    # WordPress themes often put date in a <time> or <span> with class 'entry-date'
                    date_val = None
                    parent = h.parent
                    date_tag = parent.find(["time", "span"], class_=["entry-date", "published", "updated", "date"])
                    if date_tag:
                        date_val = parse_arabic_date(date_tag.get_text(strip=True))
                    
                    # If not found, look for any text matching date pattern in the container
                    if not date_val:
                        container_text = parent.get_text()
                        # Simple search for month names
                        for m_ar in MONTHS_AR:
                            if m_ar in container_text:
                                # Found a month, try to parse around it
                                # This is a bit brittle but helps
                                date_val = parse_arabic_date(container_text)
                                if date_val: break

                    offers.append({
                        "title": title,
                        "source_url": href,
                        "published_date": date_val,
                        "description": None # Description would require fetching the detail page
                    })
                
                # Deduplicate within this fetch session
                seen_urls = set()
                unique_offers = []
                for o in offers:
                    if o["source_url"] not in seen_urls:
                        unique_offers.append(o)
                        seen_urls.add(o["source_url"])
                offers = unique_offers
                
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error on page {page}: {e}")
                if page == 1: break # If first page fails, stop
            except Exception as e:
                logger.error(f"Unexpected error scraping page {page}: {e}")
                break
                
    logger.info(f"Scraped {len(offers)} offers in total")
    return offers
