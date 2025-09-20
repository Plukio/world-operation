from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import verify_api_key
from app.models.repository import Branch, Repository
from app.schemas.repository import Branch as BranchSchema
from app.schemas.repository import BranchCreate

router = APIRouter()


@router.post("/branches", response_model=BranchSchema)
def create_branch(
    branch_data: BranchCreate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key),
):
    """Create a new branch from an existing branch or from scratch."""

    # Verify repository exists
    repo = db.query(Repository).filter(Repository.id == branch_data.repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    # Check if branch name already exists in this repo
    existing_branch = (
        db.query(Branch)
        .filter(Branch.repo_id == branch_data.repo_id, Branch.name == branch_data.name)
        .first()
    )
    if existing_branch:
        raise HTTPException(status_code=400, detail="Branch name already exists")

    # Create new branch
    new_branch = Branch(repo_id=branch_data.repo_id, name=branch_data.name)

    db.add(new_branch)
    db.commit()
    db.refresh(new_branch)

    return new_branch


@router.get("/repositories/{repo_id}/branches", response_model=list[BranchSchema])
def list_branches(
    repo_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)
):
    """List all branches in a repository."""

    branches = db.query(Branch).filter(Branch.repo_id == repo_id).all()
    return branches


@router.get("/branches/{branch_id}", response_model=BranchSchema)
def get_branch(
    branch_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key),
):
    """Get a specific branch by ID."""

    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    return branch
