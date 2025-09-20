"""Scene schemas."""
from typing import Optional
from pydantic import BaseModel


class SceneBase(BaseModel):
    """Base scene schema."""
    text: str
    title: Optional[str] = None
    pov_entity_id: Optional[str] = None
    location_entity_id: Optional[str] = None


class SceneCreate(SceneBase):
    """Scene creation schema."""
    pass


class Scene(SceneBase):
    """Scene response schema."""
    id: str
    
    class Config:
        from_attributes = True


class SceneGenerateRequest(BaseModel):
    """Scene generation request schema."""
    pov: str
    location: str
    keywords: str
