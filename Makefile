# Makefile for hackathon project - shortcuts for common commands

.PHONY: help setup dev backend frontend test lint format clean db-push

help:
	@echo "📚 Available commands:"
	@echo "  make setup        - Setup project for first time"
	@echo "  make dev          - Start both backend and frontend servers"
	@echo "  make backend      - Start backend server only"
	@echo "  make frontend     - Start frontend dev server only"
	@echo "  make test         - Run tests (backend)"
	@echo "  make lint         - Run linters"
	@echo "  make format       - Format code"
	@echo "  make db-push      - Push database migrations"
	@echo "  make clean        - Clean cache and build files"

setup:
	@bash setup.sh

backend:
	@. .venv/bin/activate && uv run python backend/app/main.py

frontend:
	@cd frontend && npm run dev

dev:
	@echo "Starting development servers..."
	@echo "Backend will run on http://localhost:8000"
	@echo "Frontend will run on http://localhost:5173"
	@echo ""
	@make backend &
	@make frontend

test:
	@. .venv/bin/activate && uv run pytest backend/tests -v

lint:
	@echo "Running linters..."
	@. .venv/bin/activate && uv run ruff check backend/ --force-exclude
	@. .venv/bin/activate && uv run mypy backend/app
	@cd frontend && npm run lint

format:
	@echo "Formatting code..."
	@. .venv/bin/activate && uv run ruff format backend/ --force-exclude
	@. .venv/bin/activate && uv run ruff check backend/ --fix --force-exclude

db-push:
	@. .venv/bin/activate && uv run alembic upgrade head

db-migrate:
	@. .venv/bin/activate && uv run alembic revision --autogenerate -m "$(msg)"

clean:
	@echo "Cleaning cache files..."
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete
	@rm -rf .ruff_cache/
	@cd frontend && rm -rf node_modules/.cache/ 2>/dev/null || true
	@echo "✅ Cleaned!"

install-hooks:
	@pre-commit install

pre-commit-run:
	@pre-commit run --all-files
