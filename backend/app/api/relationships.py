"""Relationship API routes."""

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List

from app.core.db import get_db
from app.core.security import verify_api_key
from app.models.relationship import Relationship
from app.schemas.relationship import (
    Relationship as RelationshipSchema,
    RelationshipCreate,
    RelationshipUpdate,
)

router = APIRouter()


@router.get("/relationships", response_model=List[RelationshipSchema])
def get_relationships(
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Get all relationships."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    relationships = db.query(Relationship).all()
    return relationships


@router.get("/relationships/{relationship_id}", response_model=RelationshipSchema)
def get_relationship(
    relationship_id: str,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Get a specific relationship by ID."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    relationship = (
        db.query(Relationship).filter(Relationship.id == relationship_id).first()
    )
    if not relationship:
        raise HTTPException(status_code=404, detail="Relationship not found")
    return relationship


@router.post("/relationships", response_model=RelationshipSchema)
def create_relationship(
    relationship_data: RelationshipCreate,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Create a new relationship."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    new_relationship = Relationship(
        source_entity_id=relationship_data.source_entity_id,
        target_entity_id=relationship_data.target_entity_id,
        relation_type=relationship_data.relation_type,
    )

    db.add(new_relationship)
    db.commit()
    db.refresh(new_relationship)

    return new_relationship


@router.put("/relationships/{relationship_id}", response_model=RelationshipSchema)
def update_relationship(
    relationship_id: str,
    relationship_data: RelationshipUpdate,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Update a relationship."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    relationship = (
        db.query(Relationship).filter(Relationship.id == relationship_id).first()
    )
    if not relationship:
        raise HTTPException(status_code=404, detail="Relationship not found")

    relationship.source_entity_id = relationship_data.source_entity_id
    relationship.target_entity_id = relationship_data.target_entity_id
    relationship.relation_type = relationship_data.relation_type

    db.commit()
    db.refresh(relationship)

    return relationship


@router.delete("/relationships/{relationship_id}")
def delete_relationship(
    relationship_id: str,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Delete a relationship."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    relationship = (
        db.query(Relationship).filter(Relationship.id == relationship_id).first()
    )
    if not relationship:
        raise HTTPException(status_code=404, detail="Relationship not found")

    db.delete(relationship)
    db.commit()

    return {"message": "Relationship deleted successfully"}
