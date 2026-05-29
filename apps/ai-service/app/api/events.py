from fastapi import APIRouter

router = APIRouter()


@router.get("/daily")
def generate_daily_campus_event():
    """Generate a mock daily campus event."""
    return {
        "event_id": "daily-library-glitch",
        "title": "A strange notice appears near the library.",
        "description": "Students report that the digital library board is showing messages from a missing semester.",
        "location": "Library Plaza",
        "tags": ["mystery", "library", "system-glitch"],
    }
