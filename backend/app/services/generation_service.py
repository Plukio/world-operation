"""Scene generation service."""

from .llm_client import LLMClient


class GenerationService:
    """Service for generating scene variants."""

    def __init__(self):
        self.llm_client = LLMClient()

    def generate_scenes(self, pov: str, location: str, keywords: str) -> list[str]:
        """Generate 3 scene variants based on POV, location, and keywords."""

        system_prompt = """You are a creative writer. Generate engaging narrative scenes in present tense, 250-400 words each. Focus on vivid descriptions, character emotions, and immersive details."""

        user_prompt = f"""Generate 3 different scene variants with these parameters:
- Point of View: {pov}
- Location: {location}
- Keywords: {keywords}

Each scene should be 250-400 words, written in present tense, and focus on different aspects or moods while incorporating the given elements."""


        # Generate 3 variants by calling the API 3 times
        variants = []
        for i in range(3):
            variant_prompt = f"{user_prompt}\n\nGenerate variant {i+1}:"
            variant_messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": variant_prompt}
            ]
            variant = self.llm_client.respond_text(variant_messages)
            variants.append(variant)

        return variants
