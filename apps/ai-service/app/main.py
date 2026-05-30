# apps/ai-service/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Literal

app = FastAPI(
    title="Campus Quest AI Service",
    description="AI backend for NPC dialogue, hints, and event generation.",
    version="0.1.0"
)

class HealthCheckResponse(BaseModel):
    status: Literal["ok", "error"]
    service: str
    timestamp: str
    model_version: str

@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """
    Health check endpoint for the AI service.
    """
    return HealthCheckResponse(
        status="ok",
        service="campus-quest-ai-service",
        timestamp=datetime.utcnow().isoformat(),
        model_version="mock-v1"
    )

# Placeholder for future AI endpoints
class DialogueRequest(BaseModel):
    npc_id: str
    player_input: str
    context: Dict

class DialogueResponse(BaseModel):
    npc_reply: str
    emotion: str

@app.post("/ai/v1/dialogue/generate", response_model=DialogueResponse)
async def generate_dialogue(request: DialogueRequest):
    """
    Mock endpoint for generating NPC dialogue.
    Will be replaced with actual LLM integration later.
    """
    return DialogueResponse(
        npc_reply=f"Hello student! You said: '{request.player_input}'. The library system is acting weird today...",
        emotion="neutral"
    )
