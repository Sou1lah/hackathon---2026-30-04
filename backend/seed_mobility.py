"""Seed demo mobility files for both national and international tracks."""
import uuid
from sqlmodel import Session, select
from app.core.db import engine
from app.models import User
from app.models_mobility import MobilityFile, MobilityType

NATIONAL_STUDENTS = [
    {
        "reference_code": "MOB-N001",
        "student_name": "Amine Kerroum",
        "destination": "USTHB, Alger",
        "origin_university": "Univ. Badji Mokhtar, Annaba",
        "mobility_type": MobilityType.nationale,
        "status": "completed",
        "file_transfer_status": "transferred",
        "visa_status": None,
    },
    {
        "reference_code": "MOB-N002",
        "student_name": "Malik Sahli",
        "destination": "ENP, Alger",
        "origin_university": "Univ. Mentouri, Constantine",
        "mobility_type": MobilityType.nationale,
        "status": "pending",
        "file_transfer_status": "requested",
        "visa_status": None,
    },
    {
        "reference_code": "MOB-N003",
        "student_name": "Rania Bouzid",
        "destination": "USTO, Oran",
        "origin_university": "Univ. Ferhat Abbas, Sétif",
        "mobility_type": MobilityType.nationale,
        "status": "active",
        "file_transfer_status": "pending",
        "visa_status": None,
    },
]

INTERNATIONAL_STUDENTS = [
    {
        "reference_code": "MOB-I001",
        "student_name": "Sofia Red",
        "destination": "Sorbonne University, France",
        "origin_university": None,
        "mobility_type": MobilityType.internationale,
        "status": "pending",
        "file_transfer_status": "pending",
        "visa_status": "in_progress",
    },
    {
        "reference_code": "MOB-I002",
        "student_name": "Kenzy Ben",
        "destination": "MIT, USA",
        "origin_university": None,
        "mobility_type": MobilityType.internationale,
        "status": "completed",
        "file_transfer_status": "transferred",
        "visa_status": "approved",
    },
    {
        "reference_code": "MOB-I003",
        "student_name": "Yacine Hamdi",
        "destination": "TU München, Germany",
        "origin_university": None,
        "mobility_type": MobilityType.internationale,
        "status": "active",
        "file_transfer_status": "pending",
        "visa_status": "approved",
    },
]

def seed():
    with Session(engine) as session:
        # Get the first superuser to own these records
        admin = session.exec(
            select(User).where(User.is_superuser == True)
        ).first()
        if not admin:
            print("No superuser found — cannot seed mobility data.")
            return

        # Check if we already have mobility data
        existing = session.exec(select(MobilityFile).limit(1)).first()
        if existing:
            print(f"Mobility data already exists ({existing.reference_code}). Skipping seed.")
            return

        for data in NATIONAL_STUDENTS + INTERNATIONAL_STUDENTS:
            obj = MobilityFile(
                **data,
                owner_id=admin.id,
            )
            session.add(obj)

        session.commit()
        print(f"✅ Seeded {len(NATIONAL_STUDENTS)} national + {len(INTERNATIONAL_STUDENTS)} international mobility records.")


if __name__ == "__main__":
    seed()
