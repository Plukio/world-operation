# Quick Start Guide

## Prerequisites
- Python 3.11+ ✅ (You have 3.13.5)
- Node.js 20+ ✅ (Installed via Homebrew)
- PostgreSQL 15 ✅ (Installed via Homebrew)
- uv ✅ (Fast Python package manager)
- pnpm ✅ (Installed globally)

## ✅ Current Status
- ✅ Backend running on http://localhost:8000
- ✅ Frontend running on http://localhost:5173
- ✅ Database migrations completed
- ⚠️  Need to configure OpenAI API key

## 🚀 Complete Setup (Already Done)

### 1. Database Setup ✅
```bash
brew services start postgresql@15
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
createdb worldop
psql worldop -c "CREATE USER wo WITH PASSWORD 'wo';"
psql worldop -c "GRANT ALL PRIVILEGES ON DATABASE worldop TO wo;"
psql worldop -c "ALTER USER wo CREATEDB;"
psql worldop -c "GRANT ALL ON SCHEMA public TO wo;"
```

### 2. Backend Setup ✅
```bash
cd backend
uv venv
uv pip install -r requirements.txt
uv pip install pydantic-settings
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup ✅
```bash
cd frontend
pnpm install
cp .env.example .env
pnpm dev
```

## 🔑 Configure OpenAI API Key

**IMPORTANT:** You need to add your OpenAI API key to make the app work:

1. Edit `backend/.env`:
```bash
nano backend/.env
```

2. Replace `sk-REPLACE` with your actual OpenAI API key:
```
DATABASE_URL=postgresql+psycopg://wo:wo@localhost:5432/worldop
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
API_KEY=dev-key
```

3. Restart the backend server:
```bash
# Kill the current backend process (Ctrl+C)
# Then restart:
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🌐 Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🧪 Test the API
```bash
curl -X POST http://localhost:8000/api/extract \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-key" \
  -d '{"scene_text":"Alia runs through the fog toward Docklands..."}'
```

## 🎯 What You'll See

**Frontend (http://localhost:5173):**
- Writing Canvas with textarea for scene input
- "Extract Entities" button to analyze text
- "Scene Composer" button to generate variants
- Entity results sidebar showing characters, places, events, objects

**Backend (http://localhost:8000/docs):**
- Interactive API documentation
- Test endpoints directly in the browser
