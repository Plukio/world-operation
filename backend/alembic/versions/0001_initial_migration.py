"""Initial migration

Revision ID: 0001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create entities table
    op.create_table(
        "entities",
        sa.Column("id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("aliases", postgresql.ARRAY(sa.String()), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create scenes table
    op.create_table(
        "scenes",
        sa.Column("id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.Column("pov_entity_id", postgresql.UUID(as_uuid=False), nullable=True),
        sa.Column("location_entity_id", postgresql.UUID(as_uuid=False), nullable=True),
        sa.ForeignKeyConstraint(
            ["location_entity_id"],
            ["entities.id"],
        ),
        sa.ForeignKeyConstraint(
            ["pov_entity_id"],
            ["entities.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create relationships table
    op.create_table(
        "relationships",
        sa.Column("id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("source_entity_id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("target_entity_id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("relation_type", sa.String(length=100), nullable=False),
        sa.ForeignKeyConstraint(
            ["source_entity_id"],
            ["entities.id"],
        ),
        sa.ForeignKeyConstraint(
            ["target_entity_id"],
            ["entities.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create entity_provenance table
    op.create_table(
        "entity_provenance",
        sa.Column("id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("entity_id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("scene_id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("start_idx", sa.Integer(), nullable=False),
        sa.Column("end_idx", sa.Integer(), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(
            ["entity_id"],
            ["entities.id"],
        ),
        sa.ForeignKeyConstraint(
            ["scene_id"],
            ["scenes.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("entity_provenance")
    op.drop_table("relationships")
    op.drop_table("scenes")
    op.drop_table("entities")
