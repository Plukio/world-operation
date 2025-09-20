from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import verify_api_key
from app.models.repository import Commit, CommitItem, SceneVersion
from app.schemas.repository import Commit as CommitSchema
from app.schemas.repository import CommitCreate

router = APIRouter()


@router.post("/commits", response_model=CommitSchema)
def create_commit(
    commit_data: CommitCreate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key),
):
    """Create a new commit with scene versions."""

    # Verify all scene versions exist and belong to the same branch
    scene_versions = (
        db.query(SceneVersion)
        .filter(SceneVersion.id.in_(commit_data.scene_version_ids))
        .all()
    )

    if len(scene_versions) != len(commit_data.scene_version_ids):
        raise HTTPException(status_code=400, detail="Some scene versions not found")

    # Check all versions belong to the same branch
    branch_ids = {v.branch_id for v in scene_versions}
    if len(branch_ids) > 1:
        raise HTTPException(
            status_code=400, detail="All scene versions must belong to the same branch"
        )

    if commit_data.branch_id not in branch_ids:
        raise HTTPException(
            status_code=400, detail="Branch ID mismatch with scene versions"
        )

    # Create commit
    new_commit = Commit(
        repo_id=commit_data.repo_id,
        branch_id=commit_data.branch_id,
        message=commit_data.message,
        author=commit_data.author,
    )

    db.add(new_commit)
    db.flush()  # Get the commit ID

    # Create commit items
    for version_id in commit_data.scene_version_ids:
        commit_item = CommitItem(commit_id=new_commit.id, scene_version_id=version_id)
        db.add(commit_item)

    db.commit()
    db.refresh(new_commit)

    return new_commit


@router.get("/branches/{branch_id}/commits", response_model=list[CommitSchema])
def list_commits(
    branch_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key),
):
    """List all commits in a branch."""

    commits = (
        db.query(Commit)
        .filter(Commit.branch_id == branch_id)
        .order_by(Commit.created_at.desc())
        .all()
    )
    return commits


@router.get("/commits/{commit_id}", response_model=CommitSchema)
def get_commit(
    commit_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key),
):
    """Get a specific commit by ID."""

    commit = db.query(Commit).filter(Commit.id == commit_id).first()
    if not commit:
        raise HTTPException(status_code=404, detail="Commit not found")

    return commit
