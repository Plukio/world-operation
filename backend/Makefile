.PHONY: run dev migrate

run:
	uvicorn app.main:app --reload

dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

migrate:
	alembic upgrade head
