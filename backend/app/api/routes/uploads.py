import os
import uuid
import shutil
from typing import Any
from fastapi import APIRouter, File, HTTPException, UploadFile
from app.api.deps import CurrentUser

router = APIRouter(prefix="/uploads", tags=["uploads"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "conventions")

@router.post("/convention")
async def upload_convention_pdf(
    *,
    current_user: CurrentUser,
    file: UploadFile = File(...),
) -> Any:
    """
    Upload an institutional convention PDF.
    """
    if not (current_user.is_superuser or current_user.can_review_applications):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Ensure directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Generate unique filename
    file_id = str(uuid.uuid4())
    filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"url": f"/static/conventions/{filename}"}
