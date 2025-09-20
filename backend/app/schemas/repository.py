from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel


class RepositoryBase(BaseModel):
    name: str


class RepositoryCreate(RepositoryBase):
    pass


class RepositoryUpdate(RepositoryBase):
    pass


class Repository(RepositoryBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class BranchBase(BaseModel):
    name: str


class BranchCreate(BranchBase):
    repo_id: UUID
    from_branch: str | None = None


class Branch(BranchBase):
    id: UUID
    repo_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class EpisodeBase(BaseModel):
    title: str
    order_idx: int = 0


class EpisodeCreate(EpisodeBase):
    repo_id: UUID


class Episode(EpisodeBase):
    id: UUID
    repo_id: UUID

    class Config:
        from_attributes = True


class SceneBase(BaseModel):
    title: str
    order_idx: int = 0


class SceneCreate(SceneBase):
    episode_id: UUID


class Scene(SceneBase):
    id: UUID
    episode_id: UUID

    class Config:
        from_attributes = True


class SceneVersionBase(BaseModel):
    content_html: str
    meta: dict[str, Any] = {}


class SceneVersionCreate(SceneVersionBase):
    scene_id: UUID
    branch_id: UUID
    parent_version_id: UUID | None = None


class SceneVersion(SceneVersionBase):
    id: UUID
    scene_id: UUID
    branch_id: UUID
    parent_version_id: UUID | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class CommitBase(BaseModel):
    message: str
    author: str = "You"


class CommitCreate(CommitBase):
    repo_id: UUID
    branch_id: UUID
    scene_version_ids: list[UUID]


class Commit(CommitBase):
    id: UUID
    repo_id: UUID
    branch_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class PullRequestBase(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str = "open"


class PullRequestCreate(PullRequestBase):
    repo_id: UUID
    source_branch_id: UUID
    target_branch_id: UUID


class PullRequest(PullRequestBase):
    id: UUID
    repo_id: UUID
    source_branch_id: UUID
    target_branch_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class DiffRequest(BaseModel):
    left_version_id: UUID
    right_version_id: UUID


class DiffResponse(BaseModel):
    raw_diff_html: str
    semantic_summary: str
    entity_changes: dict[str, list[str]]
