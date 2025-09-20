"""Scene schemas."""

from pydantic import BaseModel


class SceneBase(BaseModel):
    """Base scene schema."""

    text: str
    title: str | None = None
    pov_entity_id: str | None = None
    location_entity_id: str | None = None


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
