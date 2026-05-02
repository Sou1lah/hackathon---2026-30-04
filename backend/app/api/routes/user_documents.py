import os
import uuid
import shutil
from typing import Any
from fastapi import APIRouter, File, HTTPException, UploadFile, Depends
from sqlmodel import select, func
from app.api.deps import CurrentUser, SessionDep
from app.models import UserDocument, UserDocumentPublic, UserDocumentsPublic, DocumentType, Message

router = APIRouter(prefix="/user-documents", tags=["user-documents"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "user_documents")

@router.post("/", response_model=UserDocumentPublic)
async def upload_user_document(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    file: UploadFile = File(...),
    type: DocumentType = DocumentType.OTHER,
) -> Any:
    """
    Upload a user document.
    """
    # Ensure directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Generate unique filename
    file_id = str(uuid.uuid4())
    extension = os.path.splitext(file.filename)[1] if file.filename else ""
    filename = f"{file_id}{extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    url = f"/static/user_documents/{filename}"
    
    document = UserDocument(
        name=file.filename or "Unnamed Document",
        type=type,
        url=url,
        owner_id=current_user.id
    )
    session.add(document)
    session.commit()
    session.refresh(document)
    return document

@router.get("/", response_model=UserDocumentsPublic)
def read_user_documents(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve user documents.
    """
    count_statement = select(func.count()).select_from(UserDocument).where(UserDocument.owner_id == current_user.id)
    count = session.exec(count_statement).one()
    
    statement = select(UserDocument).where(UserDocument.owner_id == current_user.id).offset(skip).limit(limit)
    documents = session.exec(statement).all()
    
    return UserDocumentsPublic(data=documents, count=count)

@router.delete("/{id}", response_model=Message)
def delete_user_document(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """
    Delete a user document.
    """
    document = session.get(UserDocument, id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    if document.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Optional: Delete file from filesystem
    # file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), document.url.lstrip("/"))
    # if os.path.exists(file_path):
    #     os.remove(file_path)
        
    session.delete(document)
    session.commit()
    return Message(message="Document deleted successfully")
