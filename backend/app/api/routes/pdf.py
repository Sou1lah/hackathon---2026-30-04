"""
POST /api/v1/pdf/extract

Accepts one or more PDF uploads, extracts structured data
that maps to existing DB tables, and returns a merged payload.
The endpoint also optionally patches the current user's profile
(specialty / level / language / gpa) with the extracted values.
"""

from typing import Any
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from sqlmodel import select, func
from sqlalchemy.orm import selectinload

from app.api.deps import CurrentUser, SessionDep
from app.services.pdf_extractor import extract_from_pdf
from app.models_pdf import PDFExtraction, PDFExtractionsPublic
from app.models import User

router = APIRouter(prefix="/pdf", tags=["pdf"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB per file


@router.post("/extract", response_model=dict)
async def extract_pdf_data(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    files: list[UploadFile] = File(...),
    patch_profile: bool = False,
) -> Any:
    """
    Upload one or more PDFs (CV, certificates, transcripts).
    Returns a merged dict of DB-mapped fields extracted from all documents.

    If `patch_profile=true`, automatically updates the user's
    specialty / level / language / gpa in the database.
    """
    if not files:
        raise HTTPException(status_code=422, detail="At least one PDF file is required.")

    merged: dict[str, Any] = {}
    errors: list[str] = []

    for upload in files:
        # Validate content type
        if upload.content_type not in ("application/pdf", "application/octet-stream"):
            errors.append(f"{upload.filename}: not a PDF (got {upload.content_type})")
            continue

        raw = await upload.read()

        if len(raw) > MAX_FILE_SIZE:
            errors.append(f"{upload.filename}: file too large (max 10 MB)")
            continue

        try:
            extracted = extract_from_pdf(raw)
            
            # Save a record in the "clean database" as requested
            db_record = PDFExtraction(
                filename=upload.filename,
                extracted_data=extracted,
                owner_id=current_user.id,
            )
            session.add(db_record)
            session.commit()
            session.refresh(db_record)
            
        except Exception as e:
            errors.append(f"{upload.filename}: extraction failed — {e}")
            continue

        # Merge: later files fill in gaps but don't overwrite already-found values
        for key, value in extracted.items():
            if key == "selected_interests":
                # Merge interest lists
                existing = set(merged.get("selected_interests", []))
                existing.update(value)
                merged["selected_interests"] = sorted(existing)
            elif key not in merged:
                merged[key] = value

    if not merged and errors:
        raise HTTPException(
            status_code=422,
            detail={"message": "Could not extract data from any file.", "errors": errors},
        )

    # Optionally patch user profile fields
    PROFILE_FIELDS = {"specialty", "level", "language", "gpa", "full_name"}
    if patch_profile:
        updated = False
        for field in PROFILE_FIELDS:
            if field in merged and getattr(current_user, field, None) is None:
                setattr(current_user, field, merged[field])
                updated = True
        if updated:
            session.add(current_user)
            session.commit()
            session.refresh(current_user)

    return {
        "extracted": merged,
        "errors": errors,
        "files_processed": len(files) - len(errors),
    }

@router.get("/", response_model=PDFExtractionsPublic)
def get_pdf_extractions(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve all PDF extraction records (Admin only).
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    statement = (
        select(PDFExtraction)
        .options(selectinload(PDFExtraction.owner))
        .offset(skip)
        .limit(limit)
    )
    items = session.exec(statement).all()
    count_statement = select(func.count(PDFExtraction.id))
    count = session.exec(count_statement).one()
    
    return PDFExtractionsPublic(data=items, count=count)
