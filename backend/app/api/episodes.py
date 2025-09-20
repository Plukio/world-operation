
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import verify_api_key
from app.models.story import StoryNode, Scene
from app.schemas.story import (
    StoryNode as StoryNodeSchema,
    StoryNodeCreate,
    Scene as SceneSchema,
    SceneCreate,
)

router = APIRouter()


@router.get("/structure")
def get_structure(
    repo_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)
):
    """Get story nodes and scenes structure for a repository."""

    nodes = (
        db.query(StoryNode)
        .filter(StoryNode.repo_id == repo_id)
        .order_by(StoryNode.order_idx)
        .all()
    )
    scenes = (
        db.query(Scene)
        .join(StoryNode)
        .filter(StoryNode.repo_id == repo_id)
        .order_by(Scene.order_idx)
        .all()
    )

    return {"nodes": nodes, "scenes": scenes}


@router.post("/nodes", response_model=StoryNodeSchema)
def create_node(
    node_data: StoryNodeCreate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key),
):
    """Create a new story node (Epic or Chapter)."""

    new_node = StoryNode(
        repo_id=node_data.repo_id,
        kind=node_data.kind,
        title=node_data.title,
        parent_id=node_data.parent_id,
        order_idx=node_data.order_idx,
    )

    db.add(new_node)
    db.commit()
    db.refresh(new_node)

    return new_node


@router.post("/nodes/{chapter_id}/scenes", response_model=SceneSchema)
def create_scene(
    chapter_id: str,
    scene_data: SceneCreate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key),
):
    """Create a new scene in a chapter."""

    # Verify chapter exists
    chapter = db.query(StoryNode).filter(StoryNode.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    new_scene = Scene(
        node_id=chapter_id, title=scene_data.title, order_idx=scene_data.order_idx
    )

    db.add(new_scene)
    db.commit()
    db.refresh(new_scene)

    return new_scene
