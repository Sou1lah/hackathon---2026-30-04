# Quick Reference Guide - Developer Cheatsheet

## Quick Start (5 minutes)

### Start Everything with Docker
```bash
cd /home/wael/hackathon

# Terminal 1: Start backend & database
docker compose up -d proxy db backend prestart

# Terminal 2: Start frontend
cd frontend && bun install && bun run dev

# Access
Frontend:  http://localhost:5173
API Docs:  http://localhost:8000/docs
```

### Without Docker
```bash
# Backend
cd backend
source .venv/bin/activate
fastapi run --reload app/main.py

# Frontend (new terminal)
cd frontend
bun install && bun run dev
```

---

## Project Structure Quick Map

```
BACKEND ENTRY:        backend/app/main.py
API ROUTES:           backend/app/api/routes/
DATABASE MODELS:      backend/app/models*.py
DATABASE ORM:         backend/app/crud*.py
SERVICES:             backend/app/services/
CONFIG:               backend/app/core/config.py

FRONTEND ENTRY:       frontend/src/main.tsx
ROUTES/PAGES:         frontend/src/routes/
COMPONENTS:           frontend/src/components/
HOOKS:                frontend/src/hooks/
API CLIENT:           frontend/src/client/ (auto-generated)
STYLES:               frontend/src/index.css (Tailwind)

DATABASE:             PostgreSQL (localhost:5433 in Docker)
API BASE:             http://localhost:8000/api/v1
```

---

## Common Commands

### Docker Compose
```bash
# Start services
docker compose up -d backend frontend db

# Stop all
docker compose down

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Restart service
docker compose restart backend

# Enter container shell
docker compose exec backend bash

# View running containers
docker compose ps
```

### Backend Development
```bash
cd backend

# Activate virtual environment
source .venv/bin/activate

# Install/update dependencies
uv sync
pip install -e ".[dev]"

# Run development server
fastapi run --reload app/main.py

# Run tests
pytest
pytest -v tests/api/test_users.py

# Run with coverage
pytest --cov=app

# Format code
bash scripts/format.sh
# or
ruff format ./app

# Lint code
bash scripts/lint.sh
# or
ruff check ./app --fix

# Type check
mypy app/

# Create database migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Frontend Development
```bash
cd frontend

# Install dependencies
bun install
# or
npm install

# Start dev server (with HMR)
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Run E2E tests
bun run test

# Run tests with UI
bun run test:ui

# Format & lint
bun run lint

# Generate API client from backend schema
bun run generate-client
```

---

## API Quick Reference

### Authentication
```bash
# Register
curl -X POST http://localhost:8000/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"student@univ.dz",
    "password":"secure123",
    "full_name":"John Doe",
    "role":"student_national"
  }'

# Login
curl -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=student@univ.dz&password=secure123"

# Response includes: access_token, token_type
```

### Using API Token
```bash
# Store token
TOKEN="your_jwt_token_here"

# All subsequent requests
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"
```

### Common Endpoints
```bash
# Get current user
GET  /api/v1/users/me

# List all items
GET  /api/v1/items

# Create item
POST /api/v1/items
Body: {"title":"Item Name","description":"..."}

# Get item
GET  /api/v1/items/{item_id}

# Update item
PUT  /api/v1/items/{item_id}
Body: {"title":"Updated","description":"..."}

# Delete item
DELETE /api/v1/items/{item_id}
```

---

## Database Quick Reference

### Connect to PostgreSQL
```bash
# In Docker
psql -h localhost -p 5433 -U postgres -d app

# Local installation
psql -h localhost -U postgres -d app
```

### Useful SQL Queries
```sql
-- Count users
SELECT COUNT(*) FROM "user";

-- List all users
SELECT id, email, full_name, role FROM "user";

-- Check items by owner
SELECT * FROM item WHERE owner_id = 'uuid-here';

-- View table structure
\d "user"
\d item

-- List all tables
\dt

-- View indexes
\di

-- Raw query execution
SELECT * FROM "user" WHERE email = 'student@univ.dz';
```

### Alembic Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "Add new field"

# View migration history
alembic history

# Current version
alembic current

# Apply next migration
alembic upgrade +1

# Apply specific migration
alembic upgrade abc123def

# Go to base (empty db)
alembic downgrade base

# Check what would be done
alembic upgrade head --sql
```

---

## File Locations - Where to Make Changes

### Add New API Endpoint
```
1. Create model: backend/app/models.py (or models_*.py)
   class NewModel(SQLModel, table=True):
       id: UUID = Field(primary_key=True)
       ...

2. Create CRUD: backend/app/crud.py
   def create_new(db: Session, obj_in: NewCreate) → NewModel:
       ...

3. Create route: backend/app/api/routes/new.py
   @router.post("/new")
   async def create_new(...):
       ...

4. Register route: backend/app/api/main.py
   app.include_router(new.router, prefix="/api/v1")

5. Test it: backend/tests/api/test_new.py
   def test_create_new():
       ...
```

### Add New Frontend Page/Route
```
1. Create page file: frontend/src/routes/mypage.tsx
   export const Route = createFileRoute('/mypage')({
     component: MyPage
   })

2. Add menu link: frontend/src/components/Navigation.tsx
   <Link to="/mypage">My Page</Link>

3. Create components: frontend/src/components/MyPageComponents/

4. Use data fetching:
   import { useQuery } from '@tanstack/react-query'
   const { data } = useQuery({
     queryKey: ['endpoint'],
     queryFn: () => client.endpoint.list()
   })

5. Test: frontend/tests/mypage.spec.ts
```

### Modify Database Schema
```
1. Update model: backend/app/models.py
   Add field to SQLModel class

2. Create migration:
   alembic revision --autogenerate -m "Add field_name"

3. Review migration: backend/app/alembic/versions/xxx_add_field.py

4. Apply it:
   alembic upgrade head

5. Regenerate API client:
   cd frontend && bun run generate-client
```

---

## Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://postgres:changeme@localhost:5432/app

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256

# Project
PROJECT_NAME=Mobility Hub
ENVIRONMENT=local
DEBUG=true

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-password

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:5173"]

# API
API_V1_STR=/api/v1

# Sentry (optional)
SENTRY_DSN=

# First admin user
FIRST_SUPERUSER_EMAIL=admin@example.com
FIRST_SUPERUSER_PASSWORD=changeme
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:8000
```

---

## Testing Cheatsheet

### Backend - Pytest
```bash
# Run all tests
pytest

# Run specific file
pytest tests/api/test_users.py

# Run specific test
pytest tests/api/test_users.py::test_create_user

# Run with print output
pytest -s tests/api/test_users.py

# Run with coverage
pytest --cov=app tests/

# Run with markers
pytest -m "auth"

# Run in parallel
pytest -n auto

# Verbose mode
pytest -vv
```

### Frontend - Playwright
```bash
# Run all tests
bun run test

# Run specific test
bun run test login.spec.ts

# Run with UI
bun run test --ui

# Run with headed browser (see what's happening)
bun run test --headed

# Debug mode
bun run test --debug

# Update snapshots
bun run test --update-snapshots
```

---

## Debugging Tips

### Backend Debugging

#### Option 1: FastAPI Live Reload with Breakpoints
```bash
# Use VS Code debugger
# 1. Set breakpoint in code
# 2. F5 to start debugging
# 3. Navigate to endpoint in browser
# 4. Debugger pauses at breakpoint
```

#### Option 2: Print Debugging
```python
# In your endpoint or CRUD function
print(f"DEBUG: variable = {variable}")

# View in logs
docker compose logs -f backend
```

#### Option 3: Interactive Python
```bash
# In container
docker compose exec backend bash

# Start Python REPL
python

# Import and test
>>> from app.crud import create_user
>>> from app.models import UserCreate
```

### Frontend Debugging

#### Option 1: Browser DevTools
```
- Open http://localhost:5173
- Press F12
- Console tab for errors
- Network tab to see API calls
- Sources to set breakpoints
```

#### Option 2: React DevTools Extension
```
- Install React DevTools browser extension
- Inspect component hierarchy
- Check props and state in real-time
```

#### Option 3: Vite Debug Mode
```bash
# Terminal
bun run dev

# Browser console shows:
- Hot reload status
- ESM module loading
```

---

## Common Issues & Solutions

### Backend Won't Start
```
1. Check Python version: python --version (need 3.10+)
2. Check dependencies: pip list | grep fastapi
3. Check database connection:
   psql -h localhost -U postgres -d app
4. Check environment variables:
   cat backend/.env
5. Check logs:
   docker compose logs backend
```

### Frontend Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
VITE_PORT=3000 bun run dev
```

### Database Migration Failed
```bash
# Check current version
alembic current

# View failed migration
cat backend/app/alembic/versions/latest_migration.py

# Downgrade to previous
alembic downgrade -1

# Fix migration file

# Upgrade again
alembic upgrade head
```

### API Client Generation Failed
```bash
# Ensure backend is running
docker compose up -d backend

# Manual regeneration
cd frontend
npm install

# Generate
bun run generate-client

# Check for OpenAPI schema
curl http://localhost:8000/api/v1/openapi.json
```

### Tests Not Finding Modules
```bash
# Backend
cd backend
export PYTHONPATH="${PWD}"
pytest

# Frontend
cd frontend
bun install
bun run test
```

---

## Performance Tips

### Backend
```python
# 1. Use select() for specific columns
from sqlalchemy import select

query = select(User.id, User.email)  # Not SELECT *

# 2. Use joinedload for relationships
from sqlalchemy.orm import joinedload

users = db.query(User).options(joinedload(User.items)).all()

# 3. Add indexes for common filters
class User(SQLModel, table=True):
    email: str = Field(unique=True, index=True)

# 4. Use async operations for I/O
async def get_data():
    data = await async_http_client.get(url)

# 5. Cache expensive operations
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_function(param):
    return result
```

### Frontend
```typescript
// 1. Use React.memo for components
export const UserCard = React.memo(({ user }) => {
  return <div>{user.name}</div>
})

// 2. Memoize expensive computations
const memoizedValue = useMemo(() => 
  computeExpensiveValue(a, b),
  [a, b]
)

// 3. Lazy load routes
const AdminPage = lazy(() => import('./routes/admin'))

// 4. Optimize images
<img src={image} loading="lazy" alt="..." />

// 5. Use virtual lists for large tables
import { useVirtualizer } from '@tanstack/react-virtual'
```

---

## Git Workflow

### Standard Pull Request Flow
```bash
# 1. Create feature branch
git checkout -b feature/add-internship-form

# 2. Make changes
git add .
git commit -m "feat: add internship application form"

# 3. Push branch
git push origin feature/add-internship-form

# 4. Create PR on GitHub
# Link to related issues
# Add description of changes

# 5. Address review comments
git add .
git commit -m "fix: review comments on form validation"
git push origin feature/add-internship-form

# 6. Merge to main (after approval)
git checkout main
git pull
git merge feature/add-internship-form
git push origin main

# 7. Clean up
git branch -d feature/add-internship-form
git push origin --delete feature/add-internship-form
```

### Commit Message Convention
```
feat:      New feature
fix:       Bug fix
docs:      Documentation changes
style:     Code style (formatting, etc.)
refactor:  Code refactoring
perf:      Performance improvement
test:      Test additions/changes
chore:     Build, dependencies, etc.

Examples:
- feat: add internship search filtering
- fix: user email validation regex
- docs: update API documentation
- refactor: extract user service logic
```

---

## Useful VS Code Extensions

```
Recommended Extensions:
- Python (ms-python.python)
- Pylance (ms-python.vscode-pylance)
- FastAPI (FastAPIOfficial.fastapi)
- ES7+ React/Redux/React-Native (dsznajder.es7-react-js-snippets)
- TypeScript Vue Plugin (Vue.vscode-typescript-vue-plugin)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- Playwright Test for VSCode (ms-playwright.playwright)
- Docker (ms-azuretools.vscode-docker)
- SQLTools (mtxr.sqltools)
- Thunder Client or REST Client (for API testing)
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `backend/app/main.py` | FastAPI app initialization |
| `backend/app/models.py` | Core SQLModel definitions |
| `backend/app/crud.py` | Database CRUD operations |
| `backend/app/api/main.py` | API router setup |
| `backend/app/core/config.py` | Configuration settings |
| `backend/app/core/security.py` | Authentication & JWT |
| `backend/pyproject.toml` | Backend dependencies |
| `frontend/src/main.tsx` | React entry point |
| `frontend/src/routes/__root.tsx` | Root layout |
| `frontend/package.json` | Frontend dependencies |
| `frontend/vite.config.ts` | Vite configuration |
| `frontend/tsconfig.json` | TypeScript config |
| `compose.yml` | Docker Compose services |
| `compose.override.yml` | Development overrides |
| `.env` | Environment variables |

---

## Useful Links

### Documentation
- [FastAPI](https://fastapi.tiangolo.com)
- [React](https://react.dev)
- [TanStack Query](https://tanstack.com/query)
- [TanStack Router](https://tanstack.com/router)
- [SQLModel](https://sqlmodel.tiangolo.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

### Local URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Database**: localhost:5433 (PostgreSQL)
- **Mailcatcher**: http://localhost:1080

### API Endpoints (Examples)
```
POST   /api/v1/login
POST   /api/v1/register
GET    /api/v1/users/me
PUT    /api/v1/users/me
POST   /api/v1/items
GET    /api/v1/items
GET    /api/v1/items/{item_id}
PUT    /api/v1/items/{item_id}
DELETE /api/v1/items/{item_id}
```

---

**Last Updated:** May 1, 2026  
**For detailed information, see:** DOCUMENTATION.md and ARCHITECTURE.md
