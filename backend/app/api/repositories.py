"""Repository API routes."""

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List

from app.core.db import get_db
from app.core.security import verify_api_key
from app.models.repository import Repository
from app.schemas.repository import (
    Repository as RepositorySchema,
    RepositoryCreate,
    RepositoryUpdate,
)

router = APIRouter()


@router.get("/repositories", response_model=List[RepositorySchema])
def get_repositories(
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Get all repositories."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())
    
    repositories = db.query(Repository).all()
    return repositories


@router.get("/repositories/{repository_id}", response_model=RepositorySchema)
def get_repository(
    repository_id: str,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Get a specific repository by ID."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())
    
    repository = db.query(Repository).filter(Repository.id == repository_id).first()
    if not repository:
        raise HTTPException(status_code=404, detail="Repository not found")
    return repository


@router.post("/repositories", response_model=RepositorySchema)
def create_repository(
    repository_data: RepositoryCreate,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Create a new repository."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())
    
    new_repository = Repository(
        name=repository_data.name,
    )
    
    db.add(new_repository)
    db.commit()
    db.refresh(new_repository)
    
    return new_repository


@router.put("/repositories/{repository_id}", response_model=RepositorySchema)
def update_repository(
    repository_id: str,
    repository_data: RepositoryUpdate,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Update a repository."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())
    
    repository = db.query(Repository).filter(Repository.id == repository_id).first()
    if not repository:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    repository.name = repository_data.name
    
    db.commit()
    db.refresh(repository)
    
    return repository


@router.delete("/repositories/{repository_id}")
def delete_repository(
    repository_id: str,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Delete a repository."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())
    
    repository = db.query(Repository).filter(Repository.id == repository_id).first()
    if not repository:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    db.delete(repository)
    db.commit()
    
    return {"message": "Repository deleted successfully"}
