"""FastAPI main application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import (
    branches,
    commits,
    diff,
    entities,
    episodes,
    extract,
    muse,
    scenes,
    sentiment,
    versions,
)

app = FastAPI(
    title="World Operation API",
    description="API for entity extraction and scene generation",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(extract.router, prefix="/api", tags=["extract"])
app.include_router(scenes.router, prefix="/api", tags=["scenes"])
app.include_router(entities.router, prefix="/api", tags=["entities"])
app.include_router(branches.router, prefix="/api", tags=["branches"])
app.include_router(commits.router, prefix="/api", tags=["commits"])
app.include_router(versions.router, prefix="/api", tags=["versions"])
app.include_router(diff.router, prefix="/api", tags=["diff"])
app.include_router(muse.router, prefix="/api", tags=["muse"])
app.include_router(episodes.router, prefix="/api", tags=["episodes"])
app.include_router(sentiment.router, prefix="/api", tags=["sentiment"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "World Operation API"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
