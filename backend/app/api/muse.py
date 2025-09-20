import random

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import verify_api_key
from app.schemas.muse import (
    BeatTemplateRequest,
    BeatTemplateResponse,
    ConstraintDeckRequest,
    ConstraintDeckResponse,
    MuseDiceResponse,
    ObstacleEscalatorRequest,
    ObstacleEscalatorResponse,
    POVSwapRequest,
    POVSwapResponse,
    SensoryWheelRequest,
    SensoryWheelResponse,
)
from app.services.llm_client import LLMClient

router = APIRouter()


@router.post("/muse/dice", response_model=MuseDiceResponse)
def muse_dice(db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    """Generate a random creative constraint."""

    constraints = [
        "Use only sound and taste; end with a subtext line.",
        "Shorten all sentences; raise stakes by one notch.",
        "Add three sensory details; one must be unexpected.",
        "Write in present tense; include one metaphor.",
        "Use dialogue for 70% of the scene; show don't tell.",
        "Include a ticking clock; make every word count.",
        "Write from a child's perspective; maintain adult themes.",
        "Use only questions and statements; no exclamations.",
        "Include weather as a character; affect the mood.",
        "Write backwards from the ending; reveal the beginning last.",
    ]

    # For now, return a random constraint
    # Later, this could use LLM to generate dynamic constraints
    constraint = random.choice(constraints)

    return MuseDiceResponse(constraint=constraint)


@router.post("/muse/escalate", response_model=ObstacleEscalatorResponse)
def obstacle_escalator(
    request: ObstacleEscalatorRequest,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key),
):
    """Generate escalating obstacles for the protagonist."""

    llm_client = LLMClient()

    prompt = f"""
Propose four escalating ways to make the protagonist's situation worse without breaking plausibility.

Scene (max 200 words): {request.scene_text}

Output: 4 bullets labeled +, ++, +++, ++++.
"""

    try:
        result = llm_client.respond_text(prompt)
        # Parse the response to extract the four options
        lines = result.strip().split("\n")
        options = []
        for line in lines:
            if line.strip().startswith(("+", "++", "+++", "++++")):
                options.append(line.strip())

        # Ensure we have exactly 4 options
        while len(options) < 4:
            options.append(f"{'+' * (len(options) + 1)} [Generated obstacle]")

        return ObstacleEscalatorResponse(options=options[:4])

    except Exception:
        # Fallback options
        fallback_options = [
            "+ A minor setback occurs",
            "++ A major obstacle appears",
            "+++ The situation becomes critical",
            "++++ Everything seems lost",
        ]
        return ObstacleEscalatorResponse(options=fallback_options)


@router.post("/muse/pov_swap", response_model=POVSwapResponse)
def pov_swap(
    request: POVSwapRequest,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key),
):
    """Rewrite scene from a different character's perspective."""

    llm_client = LLMClient()

    prompt = f"""
Rewrite this scene from {request.pov}'s perspective. Maintain the same events but change the internal thoughts, observations, and emotional reactions to match this character's personality and background.

Original scene:
{request.scene_text}

Rewrite from {request.pov}'s POV:
"""

    try:
        result = llm_client.respond_text(prompt)
        return POVSwapResponse(text=result)

    except Exception:
        return POVSwapResponse(text=request.scene_text)  # Fallback to original


@router.post("/muse/constraint_deck", response_model=ConstraintDeckResponse)
def constraint_deck(
    request: ConstraintDeckRequest,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key),
):
    """Apply style constraints based on sliders."""

    style_locks = {
        "tension": request.tension,
        "pace": request.pace,
        "formality": request.formality,
        "dialogue_percent": request.dialogue_percent,
        "imagery": request.imagery,
    }

    return ConstraintDeckResponse(style_locks=style_locks, applied=True)


@router.post("/muse/sensory_wheel", response_model=SensoryWheelResponse)
def sensory_wheel(
    request: SensoryWheelRequest,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key),
):
    """Enhance scene with missing sensory details."""

    llm_client = LLMClient()

    missing_senses_str = ", ".join(request.missing_senses)

    prompt = f"""
Enhance this scene by adding sensory details for: {missing_senses_str}.
Keep the original text intact but weave in 1-2 sensory details for each missing sense naturally.

Original scene:
{request.scene_text}

Enhanced scene:
"""

    try:
        result = llm_client.respond_text(prompt)
        return SensoryWheelResponse(
            enhanced_text=result, added_senses=request.missing_senses
        )

    except Exception:
        return SensoryWheelResponse(enhanced_text=request.scene_text, added_senses=[])


@router.post("/muse/beat_template", response_model=BeatTemplateResponse)
def beat_template(
    request: BeatTemplateRequest,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key),
):
    """Generate beat template structure."""

    templates = {
        "7-point": {
            "headings": [
                "Hook",
                "Plot Turn 1",
                "Pinch Point 1",
                "Midpoint",
                "Pinch Point 2",
                "Plot Turn 2",
                "Resolution",
            ],
            "description": "Seven-point story structure",
        },
        "save-the-cat": {
            "headings": [
                "Opening Image",
                "Theme Stated",
                "Set-Up",
                "Catalyst",
                "Debate",
                "Break Into Two",
                "B Story",
                "Fun and Games",
                "Midpoint",
                "Bad Guys Close In",
                "All Is Lost",
                "Dark Night of the Soul",
                "Break Into Three",
                "Finale",
                "Final Image",
            ],
            "description": "Save the Cat beat sheet",
        },
        "kishotenketsu": {
            "headings": [
                "Ki (Introduction)",
                "Sho (Development)",
                "Ten (Twist)",
                "Ketsu (Conclusion)",
            ],
            "description": "Japanese four-act structure",
        },
    }

    template = templates.get(request.template_type, templates["7-point"])

    # Generate HTML with ghost headings
    template_html = f"<div class='beat-template' data-type='{request.template_type}'>"
    for heading in template["headings"]:
        template_html += f"<h3 class='ghost-heading' data-beat='{heading.lower().replace(' ', '-')}'>{heading}</h3><p></p>"
    template_html += "</div>"

    return BeatTemplateResponse(
        template_html=template_html, ghost_headings=template["headings"]
    )
