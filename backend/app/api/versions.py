from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import verify_api_key
from app.models.repository import Branch, Scene, SceneVersion
from app.schemas.repository import (
    SceneVersion as SceneVersionSchema,
)
from app.schemas.repository import (
    SceneVersionCreate,
)

router = APIRouter()


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
