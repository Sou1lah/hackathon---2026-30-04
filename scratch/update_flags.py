from sqlmodel import Session, select, create_engine
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.models_scraper import InternshipOffer
from app.core.config import settings

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))

COUNTRIES = [
    ("France", "🇫🇷", "fr"),
    ("Germany", "🇩🇪", "de"),
    ("USA", "🇺🇸", "us"),
    ("Indonesia", "🇮🇩", "id"),
    ("UK", "🇬🇧", "gb"),
    ("Canada", "🇨🇦", "ca"),
    ("Spain", "🇪🇸", "es"),
    ("Japan", "🇯🇵", "jp"),
    ("Brazil", "🇧🇷", "br"),
]

def update_flags():
    with Session(engine) as session:
        statement = select(InternshipOffer)
        offers = session.exec(statement).all()
        print(f"Found {len(offers)} offers.")
        
        for i, offer in enumerate(offers):
            # Give some variety
            if i % 3 == 0:
                country, flag, code = COUNTRIES[i % len(COUNTRIES)]
                offer.country = country
                offer.country_flag = flag
                offer.country_code = code
                offer.mobility_type = "international"
            else:
                offer.country = "Algeria"
                offer.country_flag = "🇩🇿"
                offer.country_code = "dz"
                offer.mobility_type = "national"
            
            session.add(offer)
        
        session.commit()
        print("Updated all offers.")

if __name__ == "__main__":
    update_flags()
