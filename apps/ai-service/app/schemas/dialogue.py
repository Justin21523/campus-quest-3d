from pydantic import BaseModel
from typing import list


class DialogueRequest(BaseModel):
    npc_id: str
    player_message: str
    quest_ids: list[str] = []
    relationship_score: int = 0


class DialogueResponse(BaseModel):
    npc_id: str
    reply: str
    mood: str
    suggested_next_action: str | None = None
