"""
Main FastAPI application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from backend.app.database import create_all
from backend.app.routes import router as auth_router

# Create tables
create_all()

# Initialize FastAPI app
app = FastAPI(
    title="Hackathon API",
    description="FastAPI with OAuth2 Authentication",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)

# Health check
@app.get("/health")
async def health():
    return {"status": "ok"}

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Hackathon API",
        "auth_endpoints": {
            "google_login": "/auth/google/login",
            "github_login": "/auth/github/login",
            "get_user": "/auth/me?token=YOUR_TOKEN"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
