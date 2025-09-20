"""Entity extraction API routes."""

from typing import Any

from fastapi import APIRouter, Header, HTTPException

from ..core.security import verify_api_key
from ..services.extraction_service import ExtractionService

router = APIRouter()


@router.post("/extract")
async def extract_entities(
    request: dict[str, Any], x_api_key: str = Header(..., alias="X-API-Key")
) -> dict[str, Any]:
    """Extract entities from scene text."""

    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    scene_text = request.get("scene_text")
    if not scene_text:
        raise HTTPException(status_code=400, detail="scene_text is required")

    extraction_service = ExtractionService()
    result = extraction_service.extract_entities(scene_text)

    return result
