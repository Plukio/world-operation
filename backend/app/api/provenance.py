"""Entity Provenance API routes."""

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List

from app.core.db import get_db
from app.core.security import verify_api_key
from app.models.provenance import EntityProvenance
from pydantic import BaseModel


class EntityProvenanceBase(BaseModel):
    """Base entity provenance schema."""

    entity_id: str
    scene_id: str
    start_idx: int
    end_idx: int
    confidence: float


class EntityProvenanceCreate(EntityProvenanceBase):
    """Entity provenance creation schema."""

    pass


class EntityProvenanceUpdate(EntityProvenanceBase):
    """Entity provenance update schema."""

    pass


class EntityProvenance(EntityProvenanceBase):
    """Entity provenance response schema."""

    id: str

    class Config:
        from_attributes = True


router = APIRouter()


@router.get("/provenance", response_model=List[EntityProvenance])
def get_provenance(
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Get all entity provenance records."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    provenance = db.query(EntityProvenance).all()
    return provenance


@router.get("/provenance/{provenance_id}", response_model=EntityProvenance)
def get_provenance_record(
    provenance_id: str,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Get a specific provenance record by ID."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    provenance = (
        db.query(EntityProvenance).filter(EntityProvenance.id == provenance_id).first()
    )
    if not provenance:
        raise HTTPException(status_code=404, detail="Provenance record not found")
    return provenance


@router.post("/provenance", response_model=EntityProvenance)
def create_provenance(
    provenance_data: EntityProvenanceCreate,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Create a new provenance record."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    new_provenance = EntityProvenance(
        entity_id=provenance_data.entity_id,
        scene_id=provenance_data.scene_id,
        start_idx=provenance_data.start_idx,
        end_idx=provenance_data.end_idx,
        confidence=provenance_data.confidence,
    )

    db.add(new_provenance)
    db.commit()
    db.refresh(new_provenance)

    return new_provenance


@router.put("/provenance/{provenance_id}", response_model=EntityProvenance)
def update_provenance(
    provenance_id: str,
    provenance_data: EntityProvenanceUpdate,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Update a provenance record."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    provenance = (
        db.query(EntityProvenance).filter(EntityProvenance.id == provenance_id).first()
    )
    if not provenance:
        raise HTTPException(status_code=404, detail="Provenance record not found")

    provenance.entity_id = provenance_data.entity_id
    provenance.scene_id = provenance_data.scene_id
    provenance.start_idx = provenance_data.start_idx
    provenance.end_idx = provenance_data.end_idx
    provenance.confidence = provenance_data.confidence

    db.commit()
    db.refresh(provenance)

    return provenance


@router.delete("/provenance/{provenance_id}")
def delete_provenance(
    provenance_id: str,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Delete a provenance record."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    provenance = (
        db.query(EntityProvenance).filter(EntityProvenance.id == provenance_id).first()
    )
    if not provenance:
        raise HTTPException(status_code=404, detail="Provenance record not found")

    db.delete(provenance)
    db.commit()

    return {"message": "Provenance record deleted successfully"}
