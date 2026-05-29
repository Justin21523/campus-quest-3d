from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.dialogue import router as dialogue_router
from app.api.hints import router as hints_router
from app.api.events import router as events_router

app = FastAPI(
    title="Campus Quest AI Service",
    description="Python AI service for NPC dialogue, quest hints, and campus event generation.",
    version="0.1.0",
)

app.include_router(health_router, prefix="/health", tags=["health"])
app.include_router(dialogue_router, prefix="/dialogue", tags=["dialogue"])
app.include_router(hints_router, prefix="/hints", tags=["hints"])
app.include_router(events_router, prefix="/events", tags=["events"])
