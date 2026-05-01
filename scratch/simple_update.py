import sqlalchemy
from sqlalchemy import text
import os

# Manual DB URL from .env info
DB_URL = "postgresql://postgres:changethis@localhost:5432/app"

engine = sqlalchemy.create_engine(DB_URL)

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

def update_db():
    with engine.connect() as conn:
        # Get all IDs
        res = conn.execute(text("SELECT id FROM internshipoffer"))
        ids = [row[0] for row in res]
        print(f"Updating {len(ids)} offers...")
        
        for i, offer_id in enumerate(ids):
            if i % 3 == 0:
                country, flag, code = COUNTRIES[i % len(COUNTRIES)]
                conn.execute(text("UPDATE internshipoffer SET country=:c, country_flag=:f, country_code=:code, mobility_type='international' WHERE id=:id"), 
                             {"c": country, "f": flag, "code": code, "id": offer_id})
            else:
                conn.execute(text("UPDATE internshipoffer SET country='Algeria', country_flag='🇩🇿', country_code='dz', mobility_type='national' WHERE id=:id"), 
                             {"id": offer_id})
        
        conn.commit()
        print("Done.")

if __name__ == "__main__":
    try:
        update_db()
    except Exception as e:
        print(f"Error: {e}")
