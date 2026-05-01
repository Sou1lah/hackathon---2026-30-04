from fastapi import APIRouter

from app.api.routes import (
    activity_log,
    conventions,
    internships,
    items,
    login,
    mobility,
    private,
    users,
    utils,
    offers,
    recommendation,
    pdf,
)
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(internships.router)
api_router.include_router(conventions.router)
api_router.include_router(mobility.router)
api_router.include_router(offers.router)
from app.api.routes import overview, suivi_stage, partnerships

api_router.include_router(activity_log.router)
api_router.include_router(overview.router)
api_router.include_router(recommendation.router)
api_router.include_router(suivi_stage.router)
api_router.include_router(partnerships.router)
api_router.include_router(pdf.router)

if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
