"""Story structure schemas."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel


class StoryNodeBase(BaseModel):
    kind: str  # 'epic' or 'chapter'
    title: str
    parent_id: UUID | None = None
    order_idx: int = 0


class StoryNodeCreate(StoryNodeBase):
    repo_id: UUID


class StoryNode(StoryNodeBase):
    id: UUID
    repo_id: UUID

    class Config:
        from_attributes = True


class SceneBase(BaseModel):
    title: str
    order_idx: int = 0


class SceneCreate(SceneBase):
    node_id: UUID


class Scene(SceneBase):
    id: UUID
    node_id: UUID

    class Config:
        from_attributes = True


class StructureResponse(BaseModel):
    nodes: list[StoryNode]
    scenes: list[Scene]
