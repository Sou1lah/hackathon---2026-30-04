import sentry_sdk
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware

from app.api.main import api_router
from app.core.config import settings
from app.core.scheduler import start_scheduler, shutdown_scheduler
from sqlmodel import Session, select
from app.core.db import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start scheduler
    start_scheduler()
    yield
    # Shutdown: Stop scheduler
    shutdown_scheduler()


def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
    lifespan=lifespan,
)

# Set all CORS enabled origins
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["health"])
async def health():
    db_status = "disconnected"
    try:
        with Session(engine) as session:
            session.exec(select(1))
            db_status = "connected"
    except Exception:
        db_status = "disconnected"
    
    return {
        "status": "ok",
        "database": db_status
    }
