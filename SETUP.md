# Hackathon Project Setup Guide

## Prerequisites

- Python 3.10+ (with `uv` package manager)
- Node.js 18+
- PostgreSQL client (`psql`)
- Git

## Quick Start for New Team Members

### 1. Clone & Initialize

```bash
# Clone the repository
git clone <repo-url>
cd hackathon

# Initialize Git hooks for code quality
pre-commit install
```

### 2. Backend Setup

```bash
# Create Python virtual environment
uv venv

# Activate virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
uv sync

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials
```

### 3. Database Setup (Supabase)

```bash
# Run migrations
uv run alembic upgrade head

# Seed test data (optional)
uv run python backend/scripts/seed_db.py
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

## Environment Variables Template

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://user:password@db.supabase.co/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Frontend (`frontend/.env.local`)
```
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
```

## Development Workflow

### Backend Development
```bash
# Start backend server (from root)
source .venv/bin/activate
uv run python backend/app/main.py

# Run tests
uv run pytest backend/tests

# Format and lint
uv run ruff format backend/
uv run ruff check --fix backend/
uv run mypy backend/app
```

### Frontend Development
```bash
# Start frontend dev server
cd frontend
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

### Database Management
```bash
# Check current Supabase tables
PGPASSWORD=<password> psql -h db.supabase.co -U postgres -d postgres -c "\dt"

# Create migration
uv run alembic revision --autogenerate -m "Your migration message"

# Apply migrations
uv run alembic upgrade head

# Rollback
uv run alembic downgrade -1
```

## Project Structure

```
hackathon/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── database.py
│   ├── tests/
│   ├── scripts/
│   ├── alembic/
│   ├── requirements.txt (or pyproject.toml)
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── .pre-commit-config.yaml
├── README.md
└── SETUP.md (this file)
```

## Code Quality Standards

All code is checked with:
- **Python**: `ruff` (linting + formatting), `mypy` (type checking)
- **JavaScript/TypeScript**: `biome` (linting + formatting)
- **Pre-commit hooks**: Run automatically before commits

Run checks manually:
```bash
pre-commit run --all-files
```

## Debugging

### Backend Issues
```bash
# Check if server is running
curl http://localhost:8000/health

# View logs
journalctl -u hackathon-backend -f

# Test database connection
psql $DATABASE_URL -c "SELECT 1"
```

### Frontend Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Common Issues

### Database Connection Fails
- Check `DATABASE_URL` in `.env`
- Verify Supabase credentials
- Ensure your IP is whitelisted in Supabase

### Import Errors in Backend
- Run `uv sync` to make sure all dependencies installed
- Check Python version: `python --version` (should be 3.10+)

### Frontend Build Fails
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version` (should be 18+)

## Team Collaboration

- Create feature branches: `git checkout -b feature/your-feature`
- Keep main branch stable
- Always run `pre-commit run --all-files` before pushing
- Write meaningful commit messages

## Need Help?

- Check existing issues in GitHub
- Ask in team chat
- Review logs in `/home/wael/.config/Code/User/workspaceStorage/`

---
Last Updated: 2026-04-30
