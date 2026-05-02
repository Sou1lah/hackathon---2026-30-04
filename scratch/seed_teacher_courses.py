from sqlmodel import Session
from app.core.db import engine
from app.models_scraper import InternshipOffer
from datetime import date

def seed_teacher_courses():
    courses = [
        {
            "title": "Advanced Pedagogical Training in Computer Science",
            "description": "A comprehensive course for university professors on modern teaching methodologies in software engineering and AI.",
            "source_url": "https://univ.dz/courses/pedagogy-cs",
            "published_date": date.today(),
            "target_audience": "teacher",
            "mobility_type": "national",
            "keywords": ["pedagogy", "teaching", "computer science"],
            "university_name": "Université de Constantine",
            "country": "Algeria",
            "country_code": "dz",
            "country_flag": "🇩🇿"
        },
        {
            "title": "International Research Seminar: Renewable Energy",
            "description": "Global seminar for researchers and professors specializing in sustainable energy solutions.",
            "source_url": "https://energy-world.org/seminar-2026",
            "published_date": date.today(),
            "target_audience": "teacher",
            "mobility_type": "international",
            "keywords": ["research", "energy", "sustainability"],
            "university_name": "Stanford University",
            "country": "USA",
            "country_code": "us",
            "country_flag": "🇺🇸"
        },
        {
            "title": "Digital Transformation in Higher Education",
            "description": "Workshop on implementing digital tools and e-learning platforms in university curriculum.",
            "source_url": "https://digital-edu.eu/workshop",
            "published_date": date.today(),
            "target_audience": "teacher",
            "mobility_type": "international",
            "keywords": ["e-learning", "digital", "education"],
            "university_name": "Sorbonne Université",
            "country": "France",
            "country_code": "fr",
            "country_flag": "🇫🇷"
        }
    ]
    
    with Session(engine) as session:
        for c in courses:
            existing = session.query(InternshipOffer).filter(InternshipOffer.source_url == c["source_url"]).first()
            if not existing:
                offer = InternshipOffer(**c)
                session.add(offer)
        session.commit()
        print("Teacher courses seeded successfully!")

if __name__ == "__main__":
    seed_teacher_courses()
