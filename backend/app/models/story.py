"""Story structure models for Git-for-Fiction workflow."""

import uuid

from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..core.db import Base


class StoryNode(Base):
    """Story node (Epic or Chapter)."""

    __tablename__ = "story_nodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id = Column(
        UUID(as_uuid=True),
        ForeignKey("repositories.id", ondelete="CASCADE"),
        nullable=False,
    )
    kind = Column(String, nullable=False)  # 'epic' or 'chapter'
    title = Column(String, nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("story_nodes.id"), nullable=True)
    order_idx = Column(Integer, default=0)

    # Relationships
    repository = relationship("Repository", back_populates="story_nodes")
    parent = relationship("StoryNode", remote_side=[id], back_populates="children")
    children = relationship(
        "StoryNode", back_populates="parent", cascade="all, delete-orphan"
    )
    scenes = relationship(
        "Scene", back_populates="chapter", cascade="all, delete-orphan"
    )


class Scene(Base):
    """Scene model for Git-for-Fiction workflow."""

    __tablename__ = "scenes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    node_id = Column(
        UUID(as_uuid=True),
        ForeignKey("story_nodes.id", ondelete="CASCADE"),
        nullable=False,
    )
    title = Column(String, nullable=False)
    order_idx = Column(Integer, default=0)

    # Relationships
    chapter = relationship("StoryNode", back_populates="scenes")
    versions = relationship(
        "SceneVersion", back_populates="scene", cascade="all, delete-orphan"
    )


class SceneBranchLatest(Base):
    """Fast pointer to latest version of a scene on a branch."""

    __tablename__ = "scene_branch_latest"

    scene_id = Column(
        UUID(as_uuid=True),
        ForeignKey("scenes.id", ondelete="CASCADE"),
        primary_key=True,
    )
    branch_id = Column(
        UUID(as_uuid=True),
        ForeignKey("branches.id", ondelete="CASCADE"),
        primary_key=True,
    )
    version_id = Column(
        UUID(as_uuid=True),
        ForeignKey("scene_versions.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Relationships
    scene = relationship("Scene")
    branch = relationship("Branch")
    version = relationship("SceneVersion")
