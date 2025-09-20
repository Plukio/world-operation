"""Entity provenance model."""

import uuid

from sqlalchemy import Column, Float, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID

from ..core.db import Base


class EntityProvenance(Base):
    """Entity provenance model for tracking entity mentions in scenes."""

    __tablename__ = "entity_provenance"

    id = Column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    entity_id = Column(UUID(as_uuid=False), ForeignKey("entities.id"), nullable=False)
    scene_id = Column(UUID(as_uuid=False), ForeignKey("scenes.id"), nullable=False)
    start_idx = Column(Integer, nullable=False)
    end_idx = Column(Integer, nullable=False)
    confidence = Column(Float, nullable=False)
