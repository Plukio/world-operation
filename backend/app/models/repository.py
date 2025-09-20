import uuid

from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.db import Base


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    branches = relationship(
        "Branch", back_populates="repository", cascade="all, delete-orphan"
    )
    story_nodes = relationship(
        "StoryNode", back_populates="repository", cascade="all, delete-orphan"
    )
    commits = relationship(
        "Commit", back_populates="repository", cascade="all, delete-orphan"
    )
    pull_requests = relationship(
        "PullRequest", back_populates="repository", cascade="all, delete-orphan"
    )


class Branch(Base):
    __tablename__ = "branches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id = Column(
        UUID(as_uuid=True),
        ForeignKey("repositories.id", ondelete="CASCADE"),
        nullable=False,
    )
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    repository = relationship("Repository", back_populates="branches")
    scene_versions = relationship(
        "SceneVersion", back_populates="branch", cascade="all, delete-orphan"
    )
    commits = relationship(
        "Commit", back_populates="branch", cascade="all, delete-orphan"
    )
    source_pull_requests = relationship(
        "PullRequest",
        foreign_keys="PullRequest.source_branch_id",
        back_populates="source_branch",
    )
    target_pull_requests = relationship(
        "PullRequest",
        foreign_keys="PullRequest.target_branch_id",
        back_populates="target_branch",
    )


class SceneVersion(Base):
    __tablename__ = "scene_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scene_id = Column(
        UUID(as_uuid=True), ForeignKey("scenes.id", ondelete="CASCADE"), nullable=False
    )
    branch_id = Column(
        UUID(as_uuid=True),
        ForeignKey("branches.id", ondelete="CASCADE"),
        nullable=False,
    )
    parent_version_id = Column(
        UUID(as_uuid=True), ForeignKey("scene_versions.id"), nullable=True
    )
    content_html = Column(Text, nullable=False)
    meta = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    scene = relationship("Scene", back_populates="versions")
    branch = relationship("Branch", back_populates="scene_versions")
    parent_version = relationship("SceneVersion", remote_side=[id])
    commit_items = relationship(
        "CommitItem", back_populates="scene_version", cascade="all, delete-orphan"
    )


class Commit(Base):
    __tablename__ = "commits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id = Column(
        UUID(as_uuid=True),
        ForeignKey("repositories.id", ondelete="CASCADE"),
        nullable=False,
    )
    branch_id = Column(
        UUID(as_uuid=True),
        ForeignKey("branches.id", ondelete="CASCADE"),
        nullable=False,
    )
    message = Column(Text, nullable=False)
    author = Column(String, default="You")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    repository = relationship("Repository", back_populates="commits")
    branch = relationship("Branch", back_populates="commits")
    commit_items = relationship(
        "CommitItem", back_populates="commit", cascade="all, delete-orphan"
    )


class CommitItem(Base):
    __tablename__ = "commit_items"

    commit_id = Column(
        UUID(as_uuid=True),
        ForeignKey("commits.id", ondelete="CASCADE"),
        nullable=False,
        primary_key=True,
    )
    scene_version_id = Column(
        UUID(as_uuid=True),
        ForeignKey("scene_versions.id", ondelete="CASCADE"),
        nullable=False,
        primary_key=True,
    )

    # Relationships
    commit = relationship("Commit", back_populates="commit_items")
    scene_version = relationship("SceneVersion", back_populates="commit_items")


class PullRequest(Base):
    __tablename__ = "pull_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id = Column(
        UUID(as_uuid=True),
        ForeignKey("repositories.id", ondelete="CASCADE"),
        nullable=False,
    )
    source_branch_id = Column(
        UUID(as_uuid=True), ForeignKey("branches.id"), nullable=False
    )
    target_branch_id = Column(
        UUID(as_uuid=True), ForeignKey("branches.id"), nullable=False
    )
    title = Column(String)
    description = Column(Text)
    status = Column(String, default="open")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    repository = relationship("Repository", back_populates="pull_requests")
    source_branch = relationship(
        "Branch", foreign_keys=[source_branch_id], back_populates="source_pull_requests"
    )
    target_branch = relationship(
        "Branch", foreign_keys=[target_branch_id], back_populates="target_pull_requests"
    )
