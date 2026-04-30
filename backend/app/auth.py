"""
OAuth2 authentication logic
"""

import os
import jwt
import httpx
import secrets
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session

from backend.app.models import User
from backend.app.schemas import UserResponse

# Config
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# OAuth URLs
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
GITHUB_REDIRECT_URI = os.getenv("GITHUB_REDIRECT_URI", "http://localhost:8000/auth/github/callback")

def create_access_token(user_id: int) -> str:
    """Create JWT access token"""
    payload = {
        "sub": str(user_id),
        "exp": datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS),
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def verify_token(token: str) -> Optional[int]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        return user_id
    except:
        return None

async def exchange_google_code(code: str) -> Optional[dict]:
    """Exchange Google auth code for user info"""
    if not GOOGLE_CLIENT_ID:
        return None
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code"
            }
        )
        
        if response.status_code != 200:
            return None
        
        token_data = response.json()
        id_token = token_data.get("id_token")
        
        # Decode ID token (simplified - in production use proper JWT validation)
        try:
            payload = jwt.decode(id_token, options={"verify_signature": False})
            return {
                "email": payload.get("email"),
                "name": payload.get("name"),
                "picture": payload.get("picture"),
                "provider_id": payload.get("sub")
            }
        except:
            return None

async def exchange_github_code(code: str) -> Optional[dict]:
    """Exchange GitHub auth code for user info"""
    if not GITHUB_CLIENT_ID:
        return None
    
    async with httpx.AsyncClient() as client:
        # Get access token
        response = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": GITHUB_REDIRECT_URI
            },
            headers={"Accept": "application/json"}
        )
        
        if response.status_code != 200:
            return None
        
        token_data = response.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            return None
        
        # Get user info
        response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if response.status_code != 200:
            return None
        
        user_data = response.json()
        return {
            "email": user_data.get("email"),
            "name": user_data.get("name"),
            "picture": user_data.get("avatar_url"),
            "provider_id": str(user_data.get("id")),
            "username": user_data.get("login")
        }

def get_or_create_user(db: Session, provider: str, user_info: dict) -> Optional[User]:
    """Get existing user or create new one"""
    email = user_info.get("email")
    provider_id = user_info.get("provider_id")
    
    # Try to find by email first
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # Update user info
        user.full_name = user_info.get("name", user.full_name)
        user.avatar_url = user_info.get("picture", user.avatar_url)
        user.updated_at = datetime.utcnow()
    else:
        # Create new user
        user = User(
            email=email,
            username=user_info.get("username", email.split("@")[0]),
            full_name=user_info.get("name"),
            avatar_url=user_info.get("picture"),
            provider=provider,
            provider_id=provider_id,
            is_active=True
        )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
