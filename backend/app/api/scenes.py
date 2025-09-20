"""Scene generation API routes."""

from fastapi import APIRouter, Header

from ..core.security import verify_api_key
from ..schemas.scene import SceneGenerateRequest
from ..services.generation_service import GenerationService

router = APIRouter()


@router.post("/scenes/generate")
async def generate_scenes(
    request: SceneGenerateRequest, x_api_key: str = Header(..., alias="X-API-Key")
) -> list[str]:
    """Generate 3 scene variants."""

    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    generation_service = GenerationService()
    variants = generation_service.generate_scenes(
        pov=request.pov, location=request.location, keywords=request.keywords
    )

    return variants
