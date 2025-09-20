"""Git-like fiction workflow schema

Revision ID: 0002_git_like_fiction_schema
Revises: 0001_initial_migration
Create Date: 2024-01-20 10:00:00.000000

"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision = "0002_git_like_fiction_schema"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    # Create repositories table (one per World/Project)
    op.create_table(
        "repositories",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
    )

    # Create branches table
    op.create_table(
        "branches",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("repo_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.ForeignKeyConstraint(["repo_id"], ["repositories.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("repo_id", "name", name="uq_branches_repo_name"),
    )

    # Create episodes table
    op.create_table(
        "episodes",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("repo_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("order_idx", sa.Integer(), default=0),
        sa.ForeignKeyConstraint(["repo_id"], ["repositories.id"], ondelete="CASCADE"),
    )

    # Note: scenes table already exists from initial migration
    # We'll add episode_id column to existing scenes table
    op.add_column(
        "scenes", sa.Column("episode_id", postgresql.UUID(as_uuid=True), nullable=True)
    )
    op.add_column("scenes", sa.Column("order_idx", sa.Integer(), default=0))

    # Create scene_versions table (file content per branch commit)
    op.create_table(
        "scene_versions",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("scene_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("branch_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("parent_version_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("content_html", sa.Text(), nullable=False),
        sa.Column("meta", postgresql.JSONB(), default=sa.text("'{}'::jsonb")),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.ForeignKeyConstraint(["scene_id"], ["scenes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["branch_id"], ["branches.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["parent_version_id"], ["scene_versions.id"]),
    )

    # Create commits table (group multiple scene_versions)
    op.create_table(
        "commits",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("repo_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("branch_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("author", sa.Text(), default="You"),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.ForeignKeyConstraint(["repo_id"], ["repositories.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["branch_id"], ["branches.id"], ondelete="CASCADE"),
    )

    # Create commit_items table (which versions are part of a commit)
    op.create_table(
        "commit_items",
        sa.Column("commit_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("scene_version_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["commit_id"], ["commits.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["scene_version_id"], ["scene_versions.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("commit_id", "scene_version_id"),
    )

    # Create pull_requests table
    op.create_table(
        "pull_requests",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("repo_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source_branch_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("target_branch_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.Text()),
        sa.Column("description", sa.Text()),
        sa.Column("status", sa.Text(), default="open"),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
        sa.ForeignKeyConstraint(["repo_id"], ["repositories.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["source_branch_id"], ["branches.id"]),
        sa.ForeignKeyConstraint(["target_branch_id"], ["branches.id"]),
    )


def downgrade():
    op.drop_table("pull_requests")
    op.drop_table("commit_items")
    op.drop_table("commits")
    op.drop_table("scene_versions")
    op.drop_column("scenes", "order_idx")
    op.drop_column("scenes", "episode_id")
    op.drop_table("episodes")
    op.drop_table("branches")
    op.drop_table("repositories")
