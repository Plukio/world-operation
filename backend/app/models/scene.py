"""Scene model."""
from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

from ..core.db import Base


class Scene(Base):
    """Scene model for generated content."""
    
    __tablename__ = "scenes"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    text = Column(Text, nullable=False)
    title = Column(String(255))
    pov_entity_id = Column(UUID(as_uuid=False), ForeignKey("entities.id"))
    location_entity_id = Column(UUID(as_uuid=False), ForeignKey("entities.id"))
