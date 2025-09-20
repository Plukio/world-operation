from uuid import UUID

from pydantic import BaseModel


class MuseDiceResponse(BaseModel):
    constraint: str


class ObstacleEscalatorRequest(BaseModel):
    scene_text: str
    level: int = 2


class ObstacleEscalatorResponse(BaseModel):
    options: list[str]


class POVSwapRequest(BaseModel):
    scene_text: str
    pov: str


class POVSwapResponse(BaseModel):
    text: str


class WhatIfForkRequest(BaseModel):
    from_branch_id: UUID
    scene_id: UUID
    what_if: str


class WhatIfForkResponse(BaseModel):
    new_branch_id: UUID
    new_version_id: UUID
    commit_id: UUID


class ConstraintDeckRequest(BaseModel):
    tension: float = 0.5  # 0-1
    pace: float = 0.5  # 0-1
    formality: float = 0.5  # 0-1
    dialogue_percent: float = 0.3  # 0-1
    imagery: float = 0.5  # 0-1


class ConstraintDeckResponse(BaseModel):
    style_locks: dict[str, float]
    applied: bool


class SensoryWheelRequest(BaseModel):
    scene_text: str
    missing_senses: list[str]  # ["sight", "sound", "scent", "touch", "taste"]


class SensoryWheelResponse(BaseModel):
    enhanced_text: str
    added_senses: list[str]


class BeatTemplateRequest(BaseModel):
    template_type: str  # "7-point", "save-the-cat", "kishotenketsu"
    scene_length: int = 300


class BeatTemplateResponse(BaseModel):
    template_html: str
    ghost_headings: list[str]
