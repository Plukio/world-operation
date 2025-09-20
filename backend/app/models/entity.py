"""Entity model."""
import uuid

from sqlalchemy import ARRAY, Column, String, Text
from sqlalchemy.dialects.postgresql import UUID

from ..core.db import Base


class Entity(Base):
    """Entity model for characters, places, objects, etc."""

    __tablename__ = "entities"

    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(String(50), nullable=False)  # character, place, object, event
    name = Column(String(255), nullable=False)
    description = Column(Text)
    aliases = Column(ARRAY(String), default=list)
