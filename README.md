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

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **AI**: OpenAI API with Structured Outputs
