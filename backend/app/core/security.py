"""Security utilities."""

from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import settings

security = HTTPBearer()


def verify_api_key(credentials: HTTPAuthorizationCredentials):
    """Verify API key from request headers."""
    if credentials.credentials != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key"
        )
    return credentials.credentials
