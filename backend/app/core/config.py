"""Application configuration."""
import os
from typing import Optional

from pydantic import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    database_url: str = "postgresql+psycopg://wo:wo@localhost:5432/worldop"
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o-mini"
    api_key: str = "dev-key"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
