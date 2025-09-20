from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.core.db import get_db
from app.core.security import verify_api_key
from app.models.repository import SceneVersion

router = APIRouter()


class SentimentPoint(BaseModel):
    version_id: str
    score: float
    created_at: str


@router.get("/sentiment/series", response_model=List[SentimentPoint])
def get_sentiment_series(
    scene_id: str,
    branch_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    """Get sentiment series for a scene across all versions."""
    
    versions = (
        db.query(SceneVersion)
        .filter(SceneVersion.scene_id == scene_id)
        .filter(SceneVersion.branch_id == branch_id)
        .order_by(SceneVersion.created_at.asc())
        .all()
    )
    
    sentiment_points = []
    for version in versions:
        sentiment = version.meta.get("sentiment", 0.0) if version.meta else 0.0
        sentiment_points.append(SentimentPoint(
            version_id=str(version.id),
            score=sentiment,
            created_at=version.created_at.isoformat()
        ))
    
    return sentiment_points
