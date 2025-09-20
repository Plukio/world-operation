"""Entity schemas."""

from pydantic import BaseModel


class EntityBase(BaseModel):
    """Base entity schema."""

    type: str
    name: str
    description: str | None = None
    aliases: list[str] = []


class EntityCreate(EntityBase):
    """Entity creation schema."""

    pass


class Entity(EntityBase):
    """Entity response schema."""

    id: str

    class Config:
        from_attributes = True
