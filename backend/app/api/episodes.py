from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.db import get_db
from app.core.security import verify_api_key
from app.models.repository import Episode, Scene
from app.schemas.repository import EpisodeCreate, Episode as EpisodeSchema, SceneCreate, Scene as SceneSchema

router = APIRouter()


@router.get("/episodes/structure")
def get_structure(
    repo_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    """Get episodes and scenes structure for a repository."""
    
    episodes = db.query(Episode).filter(Episode.repo_id == repo_id).order_by(Episode.order_idx).all()
    scenes = db.query(Scene).join(Episode).filter(Episode.repo_id == repo_id).order_by(Scene.order_idx).all()
    
    return {
        "episodes": episodes,
        "scenes": scenes
    }


@router.post("/episodes", response_model=EpisodeSchema)
def create_episode(
    episode_data: EpisodeCreate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    """Create a new episode."""
    
    new_episode = Episode(
        repo_id=episode_data.repo_id,
        title=episode_data.title,
        order_idx=episode_data.order_idx
    )
    
    db.add(new_episode)
    db.commit()
    db.refresh(new_episode)
    
    return new_episode


@router.post("/episodes/{episode_id}/scenes", response_model=SceneSchema)
def create_scene(
    episode_id: str,
    scene_data: SceneCreate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    """Create a new scene in an episode."""
    
    # Verify episode exists
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    
    new_scene = Scene(
        episode_id=episode_id,
        title=scene_data.title,
        order_idx=scene_data.order_idx
    )
    
    db.add(new_scene)
    db.commit()
    db.refresh(new_scene)
    
    return new_scene
