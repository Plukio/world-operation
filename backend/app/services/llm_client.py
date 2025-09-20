"""OpenAI LLM client with Responses API support."""
import json
from typing import Any

from openai import OpenAI

from ..core.config import settings


class LLMClient:
    """OpenAI client with structured outputs support."""

    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)

    def respond_json(self, messages: list[dict[str, str]], json_schema: dict[str, Any]) -> dict[str, Any]:
        """Get structured JSON response using OpenAI's structured outputs."""
        response = self.client.chat.completions.create(
            model=settings.openai_model,
            messages=messages,
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "structured_output",
                    "schema": json_schema,
                    "strict": True
                }
            }
        )

        content = response.choices[0].message.content
        return json.loads(content)

    def respond_text(self, messages: list[dict[str, str]]) -> str:
        """Get text response from OpenAI."""
        response = self.client.chat.completions.create(
            model=settings.openai_model,
            messages=messages
        )

        return response.choices[0].message.content
