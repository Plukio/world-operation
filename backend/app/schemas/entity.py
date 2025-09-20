"""Entity schemas."""
from typing import List, Optional
from pydantic import BaseModel


class EntityBase(BaseModel):
    """Base entity schema."""
    type: str
    name: str
    description: Optional[str] = None
    aliases: List[str] = []


class EntityCreate(EntityBase):
    """Entity creation schema."""
    pass


class Entity(EntityBase):
    """Entity response schema."""
    id: str
    
    class Config:
        from_attributes = True
