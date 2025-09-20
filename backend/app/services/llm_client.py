"""OpenAI LLM client with Responses API support."""
import json
from typing import Any, Dict, List

import openai
from openai import OpenAI

from ..core.config import settings


class LLMClient:
    """OpenAI client with structured outputs support."""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
    
    def respond_json(self, messages: List[Dict[str, str]], json_schema: Dict[str, Any]) -> Dict[str, Any]:
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
    
    def respond_text(self, messages: List[Dict[str, str]]) -> str:
        """Get text response from OpenAI."""
        response = self.client.chat.completions.create(
            model=settings.openai_model,
            messages=messages
        )
        
        return response.choices[0].message.content
