"""Entity API routes (stub)."""
from fastapi import APIRouter

router = APIRouter()


@router.get("/entities")
async def get_entities():
    """Get all entities (stub implementation)."""
    return {"entities": []}
