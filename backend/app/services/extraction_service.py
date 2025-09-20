"""Entity extraction service."""

from typing import Any

from .llm_client import LLMClient


class ExtractionService:
    """Service for extracting entities from text."""

    def __init__(self):
        self.llm_client = LLMClient()

    def extract_entities(self, scene_text: str) -> dict[str, list[dict[str, Any]]]:
        """Extract entities from scene text using OpenAI structured outputs."""

        json_schema = {
            "type": "object",
            "properties": {
                "characters": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "description": {"type": "string"},
                            "spans": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "start_idx": {"type": "integer"},
                                        "end_idx": {"type": "integer"},
                                    },
                                },
                            },
                            "confidence": {
                                "type": "number",
                                "minimum": 0,
                                "maximum": 1,
                            },
                        },
                    },
                },
                "places": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "description": {"type": "string"},
                            "spans": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "start_idx": {"type": "integer"},
                                        "end_idx": {"type": "integer"},
                                    },
                                },
                            },
                            "confidence": {
                                "type": "number",
                                "minimum": 0,
                                "maximum": 1,
                            },
                        },
                    },
                },
                "events": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "description": {"type": "string"},
                            "spans": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "start_idx": {"type": "integer"},
                                        "end_idx": {"type": "integer"},
                                    },
                                },
                            },
                            "confidence": {
                                "type": "number",
                                "minimum": 0,
                                "maximum": 1,
                            },
                        },
                    },
                },
                "objects": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "description": {"type": "string"},
                            "spans": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "start_idx": {"type": "integer"},
                                        "end_idx": {"type": "integer"},
                                    },
                                },
                            },
                            "confidence": {
                                "type": "number",
                                "minimum": 0,
                                "maximum": 1,
                            },
                        },
                    },
                },
                "relationships": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "source": {"type": "string"},
                            "target": {"type": "string"},
                            "relation_type": {"type": "string"},
                            "confidence": {
                                "type": "number",
                                "minimum": 0,
                                "maximum": 1,
                            },
                        },
                    },
                },
            },
        }

        messages = [
            {
                "role": "system",
                "content": "You are an expert at extracting entities from narrative text. Extract characters, places, events, objects, and relationships from the given scene text. For each entity, provide the name, description, character spans (start and end indices), and confidence score.",
            },
            {
                "role": "user",
                "content": f"Extract entities from this scene text:\n\n{scene_text}",
            },
        ]

        return self.llm_client.respond_json(messages, json_schema)
