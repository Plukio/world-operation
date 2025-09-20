"""Relationship schemas."""
from pydantic import BaseModel


class RelationshipBase(BaseModel):
    """Base relationship schema."""
    source_entity_id: str
    target_entity_id: str
    relation_type: str


class RelationshipCreate(RelationshipBase):
    """Relationship creation schema."""
    pass


class Relationship(RelationshipBase):
    """Relationship response schema."""
    id: str

    class Config:
        from_attributes = True
