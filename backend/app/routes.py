"""
Authentication routes - OAuth2 with Google and GitHub
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import os

from backend.app.database import get_db
from backend.app.auth import (
    create_access_token,
    verify_token,
    exchange_google_code,
    exchange_github_code,
    get_or_create_user,
    GOOGLE_CLIENT_ID,
    GOOGLE_REDIRECT_URI,
    GITHUB_CLIENT_ID,
    GITHUB_REDIRECT_URI
)
from backend.app.models import User
from backend.app.schemas import TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

# ============= GOOGLE OAUTH =============

@router.get("/google/login")
async def google_login():
    """Redirect to Google login page"""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=openid%20email%20profile"
    )
    return {"url": google_auth_url}

@router.get("/google/callback")
async def google_callback(code: str = Query(...), db: Session = Depends(get_db)):
    """Handle Google OAuth callback"""
    user_info = await exchange_google_code(code)
    
    if not user_info:
        raise HTTPException(status_code=400, detail="Failed to authenticate with Google")
    
    user = get_or_create_user(db, "google", user_info)
    
    if not user:
        raise HTTPException(status_code=400, detail="Failed to create user")
    
    access_token = create_access_token(user.id)
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.from_orm(user)
    )

# ============= GITHUB OAUTH =============

@router.get("/github/login")
async def github_login():
    """Redirect to GitHub login page"""
    if not GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GitHub OAuth not configured")
    
    github_auth_url = (
        f"https://github.com/login/oauth/authorize?"
        f"client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={GITHUB_REDIRECT_URI}"
        f"&scope=user:email"
    )
    return {"url": github_auth_url}

@router.get("/github/callback")
async def github_callback(code: str = Query(...), db: Session = Depends(get_db)):
    """Handle GitHub OAuth callback"""
    user_info = await exchange_github_code(code)
    
    if not user_info:
        raise HTTPException(status_code=400, detail="Failed to authenticate with GitHub")
    
    user = get_or_create_user(db, "github", user_info)
    
    if not user:
        raise HTTPException(status_code=400, detail="Failed to create user")
    
    access_token = create_access_token(user.id)
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.from_orm(user)
    )

# ============= USER INFO =============

@router.get("/me", response_model=UserResponse)
async def get_me(token: str = Query(...), db: Session = Depends(get_db)):
    """Get current user info from token"""
    user_id = verify_token(token)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse.from_orm(user)

@router.get("/logout")
async def logout():
    """Logout endpoint (token invalidation handled on frontend)"""
    return {"message": "Logout successful"}
