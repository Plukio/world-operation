import difflib
import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import verify_api_key
from app.models.repository import SceneVersion
from app.schemas.repository import DiffResponse
from app.services.llm_client import LLMClient

router = APIRouter()


def strip_html_tags(html_content: str) -> str:
    """Strip HTML tags to get plain text for comparison."""
    return re.sub(r"<[^>]+>", "", html_content)


def create_html_diff(text_a: str, text_b: str) -> str:
    """Create an HTML diff between two texts."""
    differ = difflib.HtmlDiff()
    return differ.make_file(
        text_a.splitlines(),
        text_b.splitlines(),
        fromdesc="Version A",
        todesc="Version B",
        context=True,
        numlines=3,
    )


@router.get("/diff", response_model=DiffResponse)
def get_diff(
    left_version_id: str,
    right_version_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key),
):
    """Get semantic and raw diff between two scene versions."""

    # Get both versions
    left_version = (
        db.query(SceneVersion).filter(SceneVersion.id == left_version_id).first()
    )
    right_version = (
        db.query(SceneVersion).filter(SceneVersion.id == right_version_id).first()
    )

    if not left_version or not right_version:
        raise HTTPException(status_code=404, detail="One or both versions not found")

    # Extract plain text
    left_text = strip_html_tags(left_version.content_html)
    right_text = strip_html_tags(right_version.content_html)

    # Create raw HTML diff
    raw_diff_html = create_html_diff(left_text, right_text)

    # Generate semantic diff using LLM
    llm_client = LLMClient()

    semantic_prompt = f"""
Compare these two scene versions and summarize the story changes in ≤120 words, then list 3 bullets of risks.

Version A:
{left_text}

Version B:
{right_text}

Return JSON with fields: semantic_summary, risks[]
"""

    try:
        semantic_result = llm_client.respond_json(
            semantic_prompt,
            {
                "type": "object",
                "properties": {
                    "semantic_summary": {"type": "string"},
                    "risks": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["semantic_summary", "risks"],
            },
        )

        semantic_summary = semantic_result.get(
            "semantic_summary", "No significant changes detected."
        )

    except Exception:
        semantic_summary = "Unable to generate semantic analysis."

    # Simple entity change detection (placeholder)
    entity_changes = {"added": [], "removed": [], "modified": []}

    return DiffResponse(
        raw_diff_html=raw_diff_html,
        semantic_summary=semantic_summary,
        entity_changes=entity_changes,
    )
