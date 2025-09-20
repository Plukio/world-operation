# World Operation

A full-stack application for entity extraction and scene generation using OpenAI's API.

## Quickstart

### Prerequisites
- Node.js ≥ 20
- Python 3.11
- Docker
- pnpm (preferred) or npm

### Run the application

1. Start PostgreSQL:
```bash
cd infra && docker compose up -d && cd ..
```

2. Start the backend:
```bash
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

3. Start the frontend (in another terminal):
```bash
cd frontend && pnpm i && cp .env.example .env && pnpm dev
```

### Example API usage

```bash
curl -X POST http://localhost:8000/api/extract \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-key" \
  -d '{"scene_text":"Alia runs through the fog toward Docklands..."}'
```

### Example .env values

**Backend (.env):**
```
DATABASE_URL=postgresql+psycopg://wo:wo@localhost:5432/worldop
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
API_KEY=dev-key
```

**Frontend (.env):**
```
VITE_API_BASE=http://localhost:8000
VITE_API_KEY=dev-key
```

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **AI**: OpenAI API with Structured Outputs

## Features

- **Writing Canvas**: Extract entities from narrative text with confidence scores
- **Scene Composer**: Generate 3 scene variants based on POV, location, and keywords
- **Entity Management**: Track characters, places, events, objects, and relationships
- **Provenance Tracking**: Link entities to specific text spans in scenes

## Development

### Backend Commands
```bash
cd backend
make dev          # Start development server
make migrate      # Run database migrations
make run          # Start production server
```

### Frontend Commands
```bash
cd frontend
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
pnpm format       # Format with Prettier
```

## Next Steps

- Entity acceptance UI for reviewing extracted entities
- Save scene endpoint for persisting generated content
- Entity relationship visualization
- Scene editing and refinement tools
