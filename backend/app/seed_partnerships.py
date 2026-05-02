import sys
import os
from datetime import date

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Add .venv site-packages
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".venv/lib/python3.10/site-packages"))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "../.env"))

from sqlmodel import Session, create_engine, select
from app.models_partnership import Partnership, PartnerType, PartnershipStatus
from app.core.config import settings

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))

def seed_partnerships():
    with Session(engine) as session:
        # Check if already seeded to avoid duplicates
        existing = session.exec(select(Partnership)).first()
        if existing:
            print("Database already has partnerships. Skipping seeding.")
            return
        
        p1 = Partnership(
            partner_name="Sonatrach University Partnership",
            partner_type=PartnerType.university,
            contact_email="contact@sonatrach.dz",
            contact_phone="+213 21 00 00 00",
            start_date=date(2026, 1, 1),
            end_date=date(2028, 1, 1),
            status=PartnershipStatus.active,
            document_url="/static/conventions/sonatrach_conv.pdf"
        )
        
        p2 = Partnership(
            partner_name="Ooredoo IT Internship Framework",
            partner_type=PartnerType.company,
            contact_email="hr@ooredoo.dz",
            contact_phone="+213 550 00 00 00",
            start_date=date(2025, 6, 1),
            end_date=date(2027, 6, 1),
            status=PartnershipStatus.active,
            document_url="/static/conventions/ooredoo_conv.pdf"
        )
        
        p3 = Partnership(
            partner_name="Cevital Logistics Agreement",
            partner_type=PartnerType.company,
            contact_email="partnership@cevital.dz",
            contact_phone="+213 34 00 00 00",
            start_date=date(2024, 9, 1),
            end_date=date(2026, 9, 1),
            status=PartnershipStatus.active,
            document_url="/static/conventions/cevital_conv.pdf"
        )
        
        session.add(p1)
        session.add(p2)
        session.add(p3)
        session.commit()
        print("Successfully seeded 3 institutional conventions.")

if __name__ == "__main__":
    # Create dummy PDFs in the static directory
    static_path = "backend/app/static/conventions"
    os.makedirs(static_path, exist_ok=True)
    
    dummy_pdf_content = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 100 700 Td (Institutional Convention) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000062 00000 n\n0000000125 00000 n\n0000000213 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n307\n%%EOF"
    
    for name in ["sonatrach_conv.pdf", "ooredoo_conv.pdf", "cevital_conv.pdf"]:
        full_path = os.path.join(static_path, name)
        with open(full_path, "w") as f:
            f.write(dummy_pdf_content)
        print(f"Created dummy PDF: {full_path}")
    
    seed_partnerships()
