"""Entity API routes."""

from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List

from app.core.db import get_db
from app.core.security import verify_api_key
from app.models.entity import Entity
from app.schemas.entity import Entity as EntitySchema, EntityCreate, EntityUpdate

router = APIRouter()


@router.get("/entities", response_model=List[EntitySchema])
def get_entities(
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Get all entities."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    entities = db.query(Entity).all()
    return entities


@router.get("/entities/{entity_id}", response_model=EntitySchema)
def get_entity(
    entity_id: str,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Get a specific entity by ID."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    return entity


@router.post("/entities", response_model=EntitySchema)
def create_entity(
    entity_data: EntityCreate,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Create a new entity."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    new_entity = Entity(
        type=entity_data.type,
        name=entity_data.name,
        description=entity_data.description,
        aliases=entity_data.aliases,
    )

    db.add(new_entity)
    db.commit()
    db.refresh(new_entity)

    return new_entity


@router.put("/entities/{entity_id}", response_model=EntitySchema)
def update_entity(
    entity_id: str,
    entity_data: EntityUpdate,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Update an entity."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")

    entity.type = entity_data.type
    entity.name = entity_data.name
    entity.description = entity_data.description
    entity.aliases = entity_data.aliases

    db.commit()
    db.refresh(entity)

    return entity


@router.delete("/entities/{entity_id}")
def delete_entity(
    entity_id: str,
    db: Session = Depends(get_db),
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    """Delete an entity."""
    # Verify API key
    verify_api_key(type("Credentials", (), {"credentials": x_api_key})())

    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")

    db.delete(entity)
    db.commit()

    return {"message": "Entity deleted successfully"}
