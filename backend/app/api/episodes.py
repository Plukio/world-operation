from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
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


class StoryNodeUpdate(BaseModel):
    title: str
    order_idx: int = 0


class SceneUpdate(BaseModel):
    title: str
    order_idx: int = 0


router = APIRouter()


@router.get("/structure")
def get_structure(
    repo_id: str, 
    db: Session = Depends(get_db), 
    x_api_key: str = Header(..., alias="X-API-Key")
):
    """Get story nodes and scenes structure for a repository."""
    
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

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
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Create a new story node (Epic or Chapter)."""
    
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

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
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Create a new scene in a chapter."""
    
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

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


@router.put("/nodes/{node_id}", response_model=StoryNodeSchema)
def update_node(
    node_id: str,
    node_data: StoryNodeUpdate,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Update a story node (Epic or Chapter)."""
    
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    node = db.query(StoryNode).filter(StoryNode.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Story node not found")

    node.title = node_data.title
    node.order_idx = node_data.order_idx

    db.commit()
    db.refresh(node)

    return node


@router.delete("/nodes/{node_id}")
def delete_node(
    node_id: str,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Delete a story node (Epic or Chapter)."""
    
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    node = db.query(StoryNode).filter(StoryNode.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Story node not found")

    db.delete(node)
    db.commit()

    return {"message": "Story node deleted successfully"}


@router.put("/scenes/{scene_id}", response_model=SceneSchema)
def update_scene(
    scene_id: str,
    scene_data: SceneUpdate,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Update a scene."""
    
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")

    scene.title = scene_data.title
    scene.order_idx = scene_data.order_idx

    db.commit()
    db.refresh(scene)

    return scene


@router.delete("/scenes/{scene_id}")
def delete_scene(
    scene_id: str,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Delete a scene."""
    
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")

    db.delete(scene)
    db.commit()

    return {"message": "Scene deleted successfully"}
