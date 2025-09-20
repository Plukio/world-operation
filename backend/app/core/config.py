"""Application configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    database_url: str = "postgresql+psycopg://wo:wo@localhost:5432/worldop"
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    api_key: str = "dev-key"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
