from fastapi import APIRouter

from app.schemas.dialogue import DialogueRequest, DialogueResponse

router = APIRouter()


@router.post("/npc", response_model=DialogueResponse)
def generate_npc_dialogue(payload: DialogueRequest):
    """Generate a mock NPC dialogue response.

    This is intentionally a mock implementation.
    Later, this service can be connected to a local LLM or an OpenAI-compatible API.
    """
    reply = (
        "I think something strange is happening around the campus system. "
        "You should check the library plaza first and look for a glowing quest marker."
    )

    return DialogueResponse(
        npc_id=payload.npc_id,
        reply=reply,
        mood="curious",
        suggested_next_action="Visit the library plaza quest marker.",
    )
