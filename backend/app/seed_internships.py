"""
Seed internship offers — Algerian + international universities with BEAUTIFUL photos.
Run: docker exec hackathon-backend-1 bash -c "export PYTHONPATH=/app/backend && python3 -m app.seed_internships"
"""
import logging
from datetime import date
from sqlmodel import Session, select
from app.core.db import engine
from app.models_scraper import InternshipOffer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

OFFERS = [
    # ── ALGERIAN UNIVERSITIES ──────────────────────────────────────────
    {
        "title": "Stage de Recherche en Intelligence Artificielle",
        "description": "Stage de 3 mois au sein du laboratoire LRIA. Travaux sur les modèles de deep learning appliqués à la vision par ordinateur. Encadrement par des enseignants-chercheurs expérimentés.",
        "source_url": "https://www.usthb.dz/stages/ia-vision-2026",
        "published_date": date(2026, 4, 15),
        "target_audience": "student",
        "mobility_type": "national",
        "keywords": ["IA", "Deep Learning", "Vision", "Python", "TensorFlow"],
        "specialty": "Informatique",
        "required_level": "M1",
        "required_language": "Français",
        "gpa_requirement": 13.0,
        "university_name": "USTHB - Université des Sciences et de la Technologie Houari Boumediene",
        "university_logo": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800", # Campus architecture
        "country_flag": "🇩🇿",
        "country": "Algérie",
    },
    {
        "title": "Stage Développement Web Full-Stack",
        "description": "Conception et développement d'une plateforme de gestion universitaire. Technologies : React, FastAPI, PostgreSQL. Stage de 2 mois rémunéré.",
        "source_url": "https://www.univ-annaba.dz/stages/fullstack-2026",
        "published_date": date(2026, 4, 20),
        "target_audience": "student",
        "mobility_type": "national",
        "keywords": ["React", "FastAPI", "PostgreSQL", "Full-Stack", "Web"],
        "specialty": "Génie Logiciel",
        "required_level": "L3",
        "required_language": "Français",
        "gpa_requirement": 12.0,
        "university_name": "Université Badji Mokhtar – Annaba",
        "university_logo": "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800", # Modern library
        "country_flag": "🇩🇿",
        "country": "Algérie",
    },
    {
        "title": "Stage Cybersécurité et Réseaux",
        "description": "Participation aux activités du centre de cybersécurité de l'université. Analyse de vulnérabilités, tests de pénétration, rédaction de rapports techniques.",
        "source_url": "https://www.univ-oran.dz/stages/cybersec-2026",
        "published_date": date(2026, 3, 28),
        "target_audience": "student",
        "mobility_type": "national",
        "keywords": ["Cybersécurité", "Pentest", "Réseaux", "Linux", "Sécurité"],
        "specialty": "Réseaux & Télécommunications",
        "required_level": "M1",
        "required_language": "Français",
        "gpa_requirement": 13.5,
        "university_name": "Université d'Oran 1 Ahmed Ben Bella",
        "university_logo": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800", # Cyber security theme
        "country_flag": "🇩🇿",
        "country": "Algérie",
    },
    {
        "title": "Stage Data Science & Big Data",
        "description": "Stage au laboratoire de recherche en traitement de données massives. Développement de pipelines ETL, analyse statistique, visualisation avec Python et Spark.",
        "source_url": "https://www.univ-constantine.dz/stages/datascience-2026",
        "published_date": date(2026, 4, 5),
        "target_audience": "student",
        "mobility_type": "national",
        "keywords": ["Data Science", "Big Data", "Spark", "Python", "ETL"],
        "specialty": "Informatique",
        "required_level": "M2",
        "required_language": "Français",
        "gpa_requirement": 14.0,
        "university_name": "Université Frères Mentouri – Constantine 1",
        "university_logo": "https://images.unsplash.com/photo-1518186239751-2467ef7f1947?auto=format&fit=crop&q=80&w=800", # Big data visualization
        "country_flag": "🇩🇿",
        "country": "Algérie",
    },
    # ── INTERNATIONAL UNIVERSITIES ────────────────────────────────────
    {
        "title": "Research Internship in Machine Learning – Barcelona",
        "description": "6-month research internship at the Computer Vision Center. Work on generative models and self-supervised learning with state-of-the-art GPU clusters.",
        "source_url": "https://www.uab.cat/internships/ml-research-2026",
        "published_date": date(2026, 3, 15),
        "target_audience": "student",
        "mobility_type": "international",
        "keywords": ["Machine Learning", "Computer Vision", "PyTorch", "Research", "GPU"],
        "specialty": "Intelligence Artificielle",
        "required_level": "M2",
        "required_language": "Anglais",
        "gpa_requirement": 14.0,
        "university_name": "Universitat Autònoma de Barcelona",
        "university_logo": "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&q=80&w=800", # Barcelona Sagrada Familia / City
        "country_flag": "🇪🇸",
        "country": "Espagne",
    },
    {
        "title": "Software Engineering Internship – Paris",
        "description": "Join the École Polytechnique's digital research team for a 4-month internship. Develop microservices for scientific computing platforms.",
        "source_url": "https://www.polytechnique.edu/internships/se-2026",
        "published_date": date(2026, 4, 1),
        "target_audience": "student",
        "mobility_type": "international",
        "keywords": ["Microservices", "Kubernetes", "Go", "Cloud", "DevOps"],
        "specialty": "Génie Logiciel",
        "required_level": "M1",
        "required_language": "Français, Anglais",
        "gpa_requirement": 15.0,
        "university_name": "École Polytechnique – Paris",
        "university_logo": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800", # Paris Eiffel Tower / City
        "country_flag": "🇫🇷",
        "country": "France",
    },
    {
        "title": "Erasmus+ Research Stage – Cybersecurity",
        "description": "Erasmus+ funded research stage at TU Berlin's cybersecurity lab. Focus on network intrusion detection and zero-trust architecture.",
        "source_url": "https://www.tu.berlin/internships/cybersec-erasmus-2026",
        "published_date": date(2026, 3, 20),
        "target_audience": "student",
        "mobility_type": "international",
        "keywords": ["Erasmus+", "Cybersécurité", "Zero-Trust", "IDS", "Réseau"],
        "specialty": "Cybersécurité",
        "required_level": "M1",
        "required_language": "Anglais",
        "gpa_requirement": 14.0,
        "university_name": "Technische Universität Berlin",
        "university_logo": "https://images.unsplash.com/photo-1599940824399-b87987cb947a?auto=format&fit=crop&q=80&w=800", # Berlin Brandenburg Gate
        "country_flag": "🇩🇪",
        "country": "Allemagne",
    },
    {
        "title": "Internship in Bioinformatics & Genomics – Montreal",
        "description": "Work with McGill's genome research institute on processing and analyzing high-throughput sequencing data. Python, R, and bioinformatics pipelines required.",
        "source_url": "https://www.mcgill.ca/internships/bioinformatics-2026",
        "published_date": date(2026, 4, 8),
        "target_audience": "student",
        "mobility_type": "international",
        "keywords": ["Bioinformatique", "Génomique", "Python", "R", "NGS"],
        "specialty": "Bioinformatique",
        "required_level": "M2",
        "required_language": "Anglais, Français",
        "gpa_requirement": 15.0,
        "university_name": "McGill University – Montréal",
        "university_logo": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800", # Montreal Skyline
        "country_flag": "🇨🇦",
        "country": "Canada",
    },
    {
        "title": "IoT & Smart Cities Internship – Málaga",
        "description": "Develop IoT sensing and data-collection infrastructure for smart city pilots. Work alongside the research team using LoRaWAN and edge computing.",
        "source_url": "https://www.uma.es/internships/iot-smartcity-2026",
        "published_date": date(2026, 4, 22),
        "target_audience": "student",
        "mobility_type": "international",
        "keywords": ["IoT", "Smart City", "LoRaWAN", "MQTT", "Edge Computing"],
        "specialty": "Réseaux & Télécommunications",
        "required_level": "M1",
        "required_language": "Anglais, Espagnol",
        "gpa_requirement": 13.0,
        "university_name": "Universidad de Málaga",
        "university_logo": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=800", # Malaga Beach/City
        "country_flag": "🇪🇸",
        "country": "Espagne",
    },
    {
        "title": "Quantum Computing Research – Grenoble",
        "description": "Internship at the CEA research centre in Grenoble. Study quantum error correction and qubit control firmware. Stipend + housing provided.",
        "source_url": "https://www.cea.fr/internships/quantum-2026",
        "published_date": date(2026, 3, 10),
        "target_audience": "student",
        "mobility_type": "international",
        "keywords": ["Quantum", "Physique", "Firmware", "Recherche", "C++"],
        "specialty": "Mathématiques Appliquées",
        "required_level": "M2",
        "required_language": "Français",
        "gpa_requirement": 16.0,
        "university_name": "CEA – Commissariat à l'Énergie Atomique, Grenoble",
        "university_logo": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800", # Alps / Grenoble
        "country_flag": "🇫🇷",
        "country": "France",
    },
    {
        "title": "Mobile App Development Internship – Valencia",
        "description": "Build cross-platform mobile applications for healthcare management with React Native and Firebase. Agile environment, international team.",
        "source_url": "https://www.upv.es/internships/mobile-health-2026",
        "published_date": date(2026, 4, 12),
        "target_audience": "student",
        "mobility_type": "international",
        "keywords": ["React Native", "Mobile", "Firebase", "Santé", "Agile"],
        "specialty": "Génie Logiciel",
        "required_level": "L3",
        "required_language": "Anglais",
        "gpa_requirement": 12.5,
        "university_name": "Universitat Politècnica de València",
        "university_logo": "https://images.unsplash.com/photo-1558642084-fd07fae52827?auto=format&fit=crop&q=80&w=800", # Valencia City of Arts
        "country_flag": "🇪🇸",
        "country": "Espagne",
    },
    {
        "title": "Blockchain & Decentralized Systems – Turin",
        "description": "Research on decentralized identity and smart contract security at Politecnico di Torino. Open to candidates with Solidity or Rust experience.",
        "source_url": "https://www.polito.it/internships/blockchain-2026",
        "published_date": date(2026, 4, 3),
        "target_audience": "student",
        "mobility_type": "international",
        "keywords": ["Blockchain", "Solidity", "Rust", "Web3", "Sécurité"],
        "specialty": "Informatique",
        "required_level": "M1",
        "required_language": "Anglais",
        "gpa_requirement": 13.5,
        "university_name": "Politecnico di Torino",
        "university_logo": "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&q=80&w=800", # Turin City
        "country_flag": "🇮🇹",
        "country": "Italie",
    },
    {
        "title": "Cloud Computing & DevOps Internship – Amsterdam",
        "description": "Join the University of Amsterdam's cloud infrastructure team. Work on Kubernetes cluster management and CI/CD pipelines.",
        "source_url": "https://www.uva.nl/internships/cloud-devops-2026",
        "published_date": date(2026, 4, 28),
        "target_audience": "student",
        "mobility_type": "international",
        "keywords": ["Cloud", "Kubernetes", "CI/CD", "DevOps", "Observability"],
        "specialty": "Génie Logiciel",
        "required_level": "M1",
        "required_language": "Anglais",
        "gpa_requirement": 13.0,
        "university_name": "Universiteit van Amsterdam",
        "university_logo": "https://images.unsplash.com/photo-1534384323796-7d9d7a8c27bb?auto=format&fit=crop&q=80&w=800", # Amsterdam Canals
        "country_flag": "🇳🇱",
        "country": "Pays-Bas",
    },
]


def seed():
    with Session(engine) as session:
        created = 0
        updated = 0
        for o in OFFERS:
            existing = session.exec(
                select(InternshipOffer).where(InternshipOffer.source_url == o["source_url"])
            ).first()
            
            if existing:
                # Update with beautiful photos
                existing.university_logo = o["university_logo"]
                existing.university_name = o["university_name"]
                existing.country_flag = o["country_flag"]
                existing.country = o["country"]
                session.add(existing)
                updated += 1
                logger.info(f"  ↻  Updated image for: {o['title'][:40]}")
            else:
                offer = InternshipOffer(**o)
                session.add(offer)
                created += 1
                logger.info(f"  ✅ Created: {o['title'][:40]}")
        
        session.commit()
        logger.info(f"\n📊 Summary: {created} created, {updated} images updated.")


if __name__ == "__main__":
    seed()
