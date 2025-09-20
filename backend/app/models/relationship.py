"""Relationship model."""

import uuid

from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from ..core.db import Base


class Relationship(Base):
    """Relationship model between entities."""

    __tablename__ = "relationships"

    id = Column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    source_entity_id = Column(
        UUID(as_uuid=False), ForeignKey("entities.id"), nullable=False
    )
    target_entity_id = Column(
        UUID(as_uuid=False), ForeignKey("entities.id"), nullable=False
    )
    relation_type = Column(String(100), nullable=False)
