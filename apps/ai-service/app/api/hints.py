from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class QuestHintRequest(BaseModel):
    quest_id: str
    current_step_id: str
    hint_level: int = 1


@router.post("/quest")
def generate_quest_hint(payload: QuestHintRequest):
    """Return a staged quest hint.

    hint_level:
    - 1: vague hint
    - 2: directional hint
    - 3: explicit hint
    """
    if payload.hint_level <= 1:
        hint = "Try talking to someone near the main plaza."
    elif payload.hint_level == 2:
        hint = "The freshman near the fountain seems to know something."
    else:
        hint = "Talk to the Lost Freshman NPC and inspect the glowing item near the fountain."

    return {
        "quest_id": payload.quest_id,
        "current_step_id": payload.current_step_id,
        "hint_level": payload.hint_level,
        "hint": hint,
    }
