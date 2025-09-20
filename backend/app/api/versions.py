from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from app.core.db import get_db
from app.core.security import verify_api_key
from app.models.repository import Branch, Scene, SceneVersion, Commit, CommitItem
from app.schemas.repository import (
    SceneVersion as SceneVersionSchema,
)
from app.schemas.repository import (
    SceneVersionCreate,
)
from app.services.llm_client import LLMClient

router = APIRouter()


class VersionSaveRequest(BaseModel):
    scene_id: str
    branch_id: str
    parent_version_id: Optional[str] = None
    content_html: str
    meta: dict = {}
    message: str = ""


class VersionSaveResponse(BaseModel):
    version_id: str


def analyze_sentiment(text: str) -> float:
    """Analyze sentiment of text using OpenAI."""
    try:
        llm_client = LLMClient()
        prompt = f"Return a single float between -1 and 1 representing the emotional valence of this passage. -1 is very negative, 0 is neutral, 1 is very positive.\n\nText: {text}"
        
        result = llm_client.respond_json(prompt, {
            "type": "object",
            "properties": {
                "sentiment": {"type": "number", "minimum": -1, "maximum": 1}
            },
            "required": ["sentiment"]
        })
        
        return result.get("sentiment", 0.0)
    except Exception:
        return 0.0


@router.post("/scene_versions", response_model=SceneVersionSchema)
def save_version(
    version_data: SceneVersionCreate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key),
):
    """Save a new version of a scene."""

    # Verify scene and branch exist
    scene = db.query(Scene).filter(Scene.id == version_data.scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")

    branch = db.query(Branch).filter(Branch.id == version_data.branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    # Verify parent version exists if provided
    if version_data.parent_version_id:
        parent = (
            db.query(SceneVersion)
            .filter(SceneVersion.id == version_data.parent_version_id)
            .first()
        )
        if not parent:
            raise HTTPException(status_code=404, detail="Parent version not found")

    # Create new version
    new_version = SceneVersion(
        scene_id=version_data.scene_id,
        branch_id=version_data.branch_id,
        parent_version_id=version_data.parent_version_id,
        content_html=version_data.content_html,
        meta=version_data.meta,
    )

    db.add(new_version)
    db.commit()
    db.refresh(new_version)

    return new_version


@router.get("/scenes/{scene_id}/versions", response_model=list[SceneVersionSchema])
def list_scene_versions(
    scene_id: str,
    branch_id: str = None,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key),
):
    """List all versions of a scene, optionally filtered by branch."""

    query = db.query(SceneVersion).filter(SceneVersion.scene_id == scene_id)

    if branch_id:
        query = query.filter(SceneVersion.branch_id == branch_id)

    versions = query.order_by(SceneVersion.created_at.desc()).all()
    return versions


@router.get("/scene_versions/{version_id}", response_model=SceneVersionSchema)
def get_version(
    version_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key),
):
    """Get a specific scene version by ID."""

    version = db.query(SceneVersion).filter(SceneVersion.id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Scene version not found")

    return version


@router.get("/versions/latest")
def get_latest_version(
    scene_id: str,
    branch_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    """Get the latest version of a scene for a specific branch."""
    
    version = (
        db.query(SceneVersion)
        .filter(SceneVersion.scene_id == scene_id)
        .filter(SceneVersion.branch_id == branch_id)
        .order_by(SceneVersion.created_at.desc())
        .first()
    )
    
    if not version:
        raise HTTPException(status_code=404, detail="No version found for this scene and branch")
    
    return version


@router.post("/versions/save", response_model=VersionSaveResponse)
def save_version_with_commit(
    request: VersionSaveRequest,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    """Save a new version and create a commit."""
    
    # Verify scene and branch exist
    scene = db.query(Scene).filter(Scene.id == request.scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    branch = db.query(Branch).filter(Branch.id == request.branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    
    # Analyze sentiment
    text_content = request.content_html.replace("<", " <").replace(">", "> ")
    sentiment = analyze_sentiment(text_content)
    
    # Update meta with sentiment
    meta = request.meta.copy()
    meta["sentiment"] = sentiment
    
    # Create new version
    new_version = SceneVersion(
        scene_id=request.scene_id,
        branch_id=request.branch_id,
        parent_version_id=request.parent_version_id,
        content_html=request.content_html,
        meta=meta,
    )
    
    db.add(new_version)
    db.flush()  # Get the version ID
    
    # Create commit
    commit = Commit(
        repo_id=branch.repo_id,
        branch_id=request.branch_id,
        message=request.message or text_content[:90] + "..." if len(text_content) > 90 else text_content,
        author="You"
    )
    
    db.add(commit)
    db.flush()  # Get the commit ID
    
    # Create commit item
    commit_item = CommitItem(
        commit_id=commit.id,
        scene_version_id=new_version.id
    )
    
    db.add(commit_item)
    db.commit()
    
    return VersionSaveResponse(version_id=str(new_version.id))
