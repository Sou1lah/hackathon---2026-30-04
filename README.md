# Mobility Hub - Complete Documentation

> [!info] Document Info **Version:** 0.1.0  
> **Last Updated:** May 1, 2026  
> **Project:** Full Stack FastAPI & React Application  
> **Status:** Active Development

---

## Table of Contents

- [[#Project Overview]]
- [[#System Architecture]]
- [[#Technology Stack]]
- [[#Directory Structure]]
- [[#Frontend Architecture]]
- [[#Backend Architecture]]
- [[#Database Schema]]
- [[#API Endpoints]]
- [[#Setup & Installation]]
- [[#Development Workflow]]
- [[#Deployment Guide]]
- [[#Contributing]]

---

## Project Overview

**Mobility Hub** is a customized version of the Full Stack FastAPI Template designed for managing internship and mobility programs in an educational context. The application facilitates:

- **Internship Management**: Students can apply for internships, track their progress, and manage conventions
- **Mobility Programs**: Support for both national and international mobility opportunities
- **Administrative Dashboard**: Tools for admins and professors to review applications and manage partnerships
- **PDF Document Handling**: Processing and extracting data from PDF files related to internships
- **Recommendation Engine**: Intelligent matching of students with internship opportunities based on profiles and preferences
- **Activity Tracking**: Comprehensive logging of user actions and system events

### Key Features

- Full-stack authentication (JWT-based)
- Role-based access control (RBAC) with permission flags
- PostgreSQL database with Alembic migrations
- Real-time API documentation with Swagger UI
- Comprehensive E2E testing with Playwright
- Dark mode support
- Email-based password recovery
- Responsive UI with Tailwind CSS & shadcn/ui
- APScheduler for background jobs
- Sentry integration for error tracking

---

## System Architecture

### High-Level System Architecture

```mermaid
graph TB
    User["User Browser"]
    React["React Frontend\nPort 5173"]
    Nginx["Nginx Reverse Proxy\nPort 80"]
    FastAPI["FastAPI Backend\nPort 8000"]
    DB["PostgreSQL\nPort 5432"]
    Cache["Cache Redis"]
    Jobs["Background Jobs\nAPScheduler"]

    User -->|HTTP REST| React
    React -->|HTTP API| Nginx
    Nginx -->|Proxy| FastAPI
    FastAPI -->|SQL| DB
    FastAPI --> Cache
    FastAPI --> Jobs
```

### Request Flow Diagram

```mermaid
sequenceDiagram
    participant User as User
    participant Frontend as React
    participant API as FastAPI
    participant DB as Database

    User->>Frontend: Click Button
    Frontend->>Frontend: Validate Form (React Hook Form)
    Frontend->>Frontend: Cache Check (TanStack Query)
    Frontend->>API: HTTP Request + JWT Token
    API->>API: Auth Middleware (Validate JWT)
    API->>API: Dependency Injection
    API->>DB: Execute Query (SQLModel ORM)
    DB-->>API: Query Result
    API-->>Frontend: JSON Response
    Frontend->>Frontend: Update Cache
    Frontend->>Frontend: Re-render Components
    Frontend-->>User: Show Updated UI
```

### Component Dependency Chain

```mermaid
graph TD
    UserInput["User Input"] -->|Data| form["React Hook Form"]
    form -->|Validate| zod["Zod Validation"]
    zod -->|Fetch| query["TanStack Query"]
    query -->|Call| client["API Client"]
    client -->|HTTP| api["Endpoints"]
    api -->|Execute| crud["CRUD Operations"]
    crud -->|Map| orm["SQLModel ORM"]
    orm -->|Query| db["PostgreSQL"]
    
```
---

## Technology Stack

### Frontend

|Technology|Purpose|Version|
|---|---|---|
|React|UI Framework|19.1.1|
|TypeScript|Type Safety|Latest|
|Vite|Build Tool & Dev Server|Latest|
|TanStack Router|Client-side Routing|1.163.3|
|TanStack Query|Data Fetching & Caching|5.90.21|
|Tailwind CSS|Utility-first CSS|4.1.18|
|shadcn/ui|Accessible Components|Latest|
|React Hook Form|Form State Management|7.68.0|
|Zod|Schema Validation|Latest|
|axios|HTTP Client|1.13.5|
|Playwright|E2E Testing|Latest|
|Biome|Linting & Formatting|Latest|

### Backend

|Technology|Purpose|Version|
|---|---|---|
|FastAPI|Web Framework|>=0.114.2|
|SQLModel|ORM + Data Validation|>=0.0.21|
|SQLAlchemy|Database Toolkit|via SQLModel|
|PostgreSQL|Database|18|
|Alembic|Database Migrations|>=1.12.1|
|Pydantic|Data Validation|>2.0|
|PyJWT|JWT Authentication|>=2.8.0|
|pwdlib|Password Hashing|>=0.3.0|
|APScheduler|Background Jobs|>=3.10.0|
|Sentry|Error Tracking|>=2.0.0|
|BeautifulSoup4|HTML/XML Parsing|>=4.12.0|
|PyPDF|PDF Processing|>=5.0.0|
|Pytest|Testing Framework|>=7.4.3|
|Mypy|Type Checking|>=1.8.0|

### Infrastructure

|Technology|Purpose|
|---|---|
|Docker & Docker Compose|Containerization & Orchestration|
|Traefik|Reverse Proxy / Load Balancer|
|Mailcatcher|Local Email Testing|
|PostgreSQL|Primary Database|
|Bun|JavaScript Package Manager|
|uv|Python Package Manager|

---

## Directory Structure

```
/home/wael/hackathon/
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI App Entry Point
│   │   ├── models.py                 # User & Item SQLModels
│   │   ├── models_mobility.py        # Mobility-related Models
│   │   ├── models_partnership.py     # Partnership Models
│   │   ├── models_suivi.py           # Internship Tracking Models
│   │   ├── models_pdf.py             # PDF Document Models
│   │   ├── models_recommendation.py  # Recommendation System Models
│   │   ├── models_scraper.py         # Web Scraping Models
│   │   ├── crud.py                   # CRUD Operations (User/Item)
│   │   ├── crud_mobility.py          # Mobility CRUD
│   │   ├── crud_partnership.py       # Partnership CRUD
│   │   ├── crud_suivi.py             # Internship Tracking CRUD
│   │   ├── api/
│   │   │   ├── main.py               # API Router Setup
│   │   │   ├── deps.py               # Shared Dependencies
│   │   │   └── routes/               # API Endpoints
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── db.py
│   │   │   ├── security.py
│   │   │   └── scheduler.py
│   │   └── services/
│   │       ├── dashboard_service.py
│   │       ├── recommendation.py
│   │       ├── nlp_processor.py
│   │       ├── pdf_extractor.py
│   │       ├── scraper.py
│   │       └── sync_offers.py
│   ├── tests/
│   ├── scripts/
│   ├── pyproject.toml
│   ├── alembic.ini
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── client/                   # Auto-generated OpenAPI Client
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── routes/
│   ├── tests/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── Dockerfile
│
├── compose.yml
├── compose.override.yml
├── compose.traefik.yml
└── nginx.conf
```

---

## Frontend Architecture

### Routing (TanStack Router)

- File-based routing system
- Type-safe route definitions
- Nested layouts support
- Built-in search parameter handling

### State Management

- **TanStack Query**: Server state — automatic caching, background refetching, optimistic updates
- **React Hook Form**: Client form state — minimal re-renders, Zod validation integration

### Component Libraries

- **shadcn/ui**: Accessible components built on Radix UI primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **Recharts**: Data visualization
- **Sonner**: Toast notifications

### Component Architecture

```mermaid
graph TD
    Root["App Root __root.tsx"]
    Layout["Layout Components"]
    Nav["Navigation/Header"]
    Sidebar["Sidebar"]
    Pages["Page Routes"]
    Dashboard["/dashboard"]
    Login["/login"]
    Admin["/admin"]
    Internships["/internships"]
    Conventions["/conventions"]
    Hooks["Custom Hooks\nuseAuth, useUser"]
    Query["TanStack Query"]
    Form["React Hook Form"]
    UI["shadcn/ui Components"]

    Root --> Layout
    Layout --> Nav
    Layout --> Sidebar
    Root --> Pages
    Pages --> Dashboard
    Pages --> Login
    Pages --> Admin
    Pages --> Internships
    Pages --> Conventions
    Dashboard --> Hooks
    Dashboard --> Query
    Dashboard --> Form
    Dashboard --> UI
```

### API Integration

```typescript
// Auto-generated client from backend OpenAPI schema
import { ApiClient } from '@/client'

const client = new ApiClient()

const { data: users } = useSuspenseQuery({
  queryKey: ['users'],
  queryFn: () => client.users.getUsersList()
})
```

---

## Backend Architecture

### Core Layers

**API Layer** (`api/`)

- Router-based endpoint organization
- Dependency injection for auth and database
- Request/response validation via Pydantic

**Models Layer** (`models*.py`)

- SQLModel definitions (DB tables + Pydantic schemas)
- Type-safe data structures with relationships

**CRUD Layer** (`crud*.py`)

- Database operations (Create, Read, Update, Delete)
- Business logic encapsulation

**Services Layer** (`services/`)

- Complex business logic
- External integrations (PDF, recommendations)
- Background job coordination

**Core Layer** (`core/`)

- Configuration management
- Database connection
- Security utilities
- Scheduler initialization

### Request Lifecycle

```mermaid
flowchart TD
    A["HTTP Request"]
    B["FastAPI Router\napi/routes/*.py"]
    C["Dependency Injection\ndeps.py"]
    D["Validate JWT Token"]
    E["Get DB Session"]
    F["Endpoint Handler"]
    G["CRUD / Service Layer"]
    H["SQLModel ORM"]
    I["PostgreSQL"]
    J["Pydantic Response Validation"]
    K["JSON Response"]

    A --> B
    B --> C
    C --> D
    C --> E
    D --> F
    E --> F
    F --> G
    G --> H
    H --> I
    I --> H
    H --> G
    G --> J
    J --> K
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant API as FastAPI
    participant DB as Database

    User->>API: POST /api/v1/login (email + password)
    API->>DB: Lookup user by email
    DB-->>API: User record
    API->>API: Verify password (pwdlib/argon2)
    API->>API: Generate JWT (PyJWT)
    API-->>User: Return access_token
    Note over User: Store token in frontend
    User->>API: Subsequent requests with Bearer token
    API->>API: Validate JWT middleware
    API-->>User: Proceed with user context
```

### Key Models

**User**

- `id`: UUID (PK)
- `email`: str — unique, `.univ.dz` domain
- `role`: UserRole (student_national, student_international, prof, admin)
- `hashed_password`, `is_active`, `is_superuser`
- Permission flags: `can_access_dashboard`, `can_apply_internship`, `can_view_convention`, etc.
- Profile data: `specialty`, `level`, `language`, `gpa`
- Activity tracking: `last_login_at`, `total_sessions`, `engagement_score`

**Item** — Basic CRUD template with owner FK

**Domain Models** — InternshipRequest, Convention, MobilityFile, Partnership, ActivityLog

---

## Database Schema

```mermaid
erDiagram
    USER ||--o{ ITEM : owns
    USER ||--o{ INTERNSHIP_REQUEST : submits
    USER ||--o{ CONVENTION : manages
    USER ||--o{ MOBILITY_FILE : manages
    USER ||--o{ ACTIVITY_LOG_ENTRY : logs
    INTERNSHIP_REQUEST ||--o{ CONVENTION : has
    INTERNSHIP_REQUEST ||--o{ ACTIVITY_LOG_ENTRY : relates_to

    USER {
        uuid id PK
        varchar email UK
        varchar full_name
        varchar role
        boolean is_active
        boolean is_superuser
        varchar specialty
        varchar level
        float gpa
        boolean can_access_dashboard
        boolean can_apply_internship
        boolean can_view_convention
        timestamptz created_at
        timestamptz last_login_at
        float engagement_score
    }

    ITEM {
        uuid id PK
        varchar title
        varchar description
        uuid owner_id FK
        timestamptz created_at
    }

    INTERNSHIP_REQUEST {
        uuid id PK
        uuid student_id FK
        varchar student_name
        varchar status
        int progress
        timestamptz created_at
    }

    CONVENTION {
        uuid id PK
        uuid internship_request_id FK
        uuid created_by_id FK
        varchar agreement_type
        timestamptz created_at
    }

    MOBILITY_FILE {
        uuid id PK
        uuid user_id FK
        varchar file_name
        varchar file_path
        timestamptz created_at
    }

    ACTIVITY_LOG_ENTRY {
        uuid id PK
        uuid user_id FK
        varchar action_type
        text details
        timestamptz timestamp
    }
```

### Key Constraints

```sql
ALTER TABLE public.user ADD CONSTRAINT user_email_key UNIQUE (email);
ALTER TABLE public.item ADD CONSTRAINT item_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES public.user(id);

CREATE INDEX idx_user_email ON public.user(email);
CREATE INDEX idx_item_owner_id ON public.item(owner_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
```

---

## API Endpoints

**Base URL:** `http://localhost:8000/api/v1`

### Authentication

|Method|Endpoint|Description|
|---|---|---|
|POST|`/login`|Login and get JWT token|
|POST|`/login/access-token`|Refresh access token|
|POST|`/register`|Register new user|
|POST|`/password-recovery/{email}`|Request password reset|
|POST|`/reset-password/`|Reset password with token|

### User Management

|Method|Endpoint|Description|
|---|---|---|
|GET|`/users`|List all users (admin only)|
|GET|`/users/{user_id}`|Get user by ID|
|POST|`/users`|Create new user (admin)|
|PUT|`/users/{user_id}`|Update user (admin)|
|DELETE|`/users/{user_id}`|Delete user (admin)|
|GET|`/users/me`|Get current user|
|PUT|`/users/me`|Update current user profile|
|POST|`/users/me/password`|Change password|

### Internship Management

|Method|Endpoint|Description|
|---|---|---|
|GET|`/internships`|List internships|
|POST|`/internships`|Create internship request|
|GET|`/internships/{id}`|Get internship details|
|PUT|`/internships/{id}`|Update internship|
|DELETE|`/internships/{id}`|Delete internship|
|POST|`/internships/{id}/apply`|Apply to internship|

### Conventions

|Method|Endpoint|Description|
|---|---|---|
|GET|`/conventions`|List conventions|
|POST|`/conventions`|Create convention|
|GET|`/conventions/{id}`|Get convention details|
|PUT|`/conventions/{id}`|Update convention|
|DELETE|`/conventions/{id}`|Delete convention|

### Mobility

|Method|Endpoint|Description|
|---|---|---|
|GET|`/mobility`|List mobility files|
|POST|`/mobility/upload`|Upload mobility file|
|GET|`/mobility/{id}`|Get mobility file|
|DELETE|`/mobility/{id}`|Delete mobility file|

### PDF Processing

|Method|Endpoint|Description|
|---|---|---|
|POST|`/pdf/upload`|Upload and process PDF|
|POST|`/pdf/extract`|Extract data from PDF|
|GET|`/pdf/{id}`|Get PDF metadata|

### Recommendations

|Method|Endpoint|Description|
|---|---|---|
|GET|`/recommendations`|Get recommendations for user|
|POST|`/recommendations/process`|Process user interactions|
|GET|`/recommendations/stats`|Get recommendation stats|

### Dashboard & Monitoring

|Method|Endpoint|Description|
|---|---|---|
|GET|`/overview`|Dashboard overview|
|GET|`/overview/stats`|System statistics|
|GET|`/activity-logs`|Activity logs|
|GET|`/health`|Health check|

**Interactive Docs:**

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/api/v1/openapi.json`

---

## Setup & Installation

### Prerequisites

- Docker & Docker Compose (recommended)
- OR: Python 3.10+, PostgreSQL 18, Node.js 18+
- `uv` — Python package manager: https://docs.astral.sh/uv/
- `bun` — JavaScript runtime: https://bun.sh/

### Option 1: Docker Compose (Recommended)

```bash
# Start backend services
docker compose up -d proxy db backend prestart

# Start frontend (separate terminal)
cd frontend
bun install
bun run dev
```

- Frontend: `http://localhost:5173`
- API Docs: `http://localhost:8000/docs`
- Database: `psql -h localhost -p 5433 -U postgres -d app`

### Option 2: Local Development

```bash
# Backend
cd backend
uv sync
source .venv/bin/activate
cp .env.example .env      # Configure DATABASE_URL
alembic upgrade head
fastapi run --reload app/main.py

# Frontend
cd frontend
bun install
echo "VITE_API_URL=http://localhost:8000" > .env.local
bun run dev
```

### Database Migrations

```bash
alembic revision --autogenerate -m "Describe changes"
alembic upgrade head
alembic history
alembic downgrade -1
```

### Environment Variables

**Backend `.env`**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/app
ENVIRONMENT=local
SECRET_KEY=your-secret-key-here
PROJECT_NAME=Mobility Hub
API_V1_STR=/api/v1
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Frontend `.env`**

```env
VITE_API_URL=http://localhost:8000
```

---

## Development Workflow

### Backend

```bash
cd backend
bash scripts/format.sh     # Format code
bash scripts/lint.sh       # Lint
mypy app/                  # Type checking
bash scripts/test.sh       # Run tests
coverage run -m pytest && coverage report
```

### Frontend

```bash
cd frontend
bun run lint               # Format & lint
bun run build              # Production build
bun run test               # E2E tests
bun run test --headed      # Tests with visible browser
```

### Hot Reload

```bash
# Backend (Docker)
docker compose watch

# Frontend
bun run dev    # HMR enabled by default
```

### Git Workflow

```bash
git checkout -b feature/your-feature-name
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature-name
# Open PR → review → merge to main
```

---

## Deployment Guide

### Production Docker Compose

```bash
docker compose build
docker compose -f compose.yml up -d
docker compose logs -f backend
```

### Production Environment

```env
ENVIRONMENT=production
DEBUG=false
ALLOWED_HOSTS=yourdomain.com
DATABASE_URL=postgresql://user:pass@db-host:5432/app
SECRET_KEY=use-strong-random-key
SENTRY_DSN=your-sentry-dsn
```

### Database Backup & Restore

```bash
# Backup
docker compose exec db pg_dump -U postgres app > backup.sql

# Restore
docker compose exec db psql -U postgres app < backup.sql
```

### Scaling

```yaml
# compose.yml
services:
  backend:
    deploy:
      replicas: 3
```

---

## Contributing

### Code Style

- Python: PEP 8, `ruff` for linting
- TypeScript: ESLint config, `biome` for formatting
- Commits: Conventional commits (`feat:`, `fix:`, `docs:`, etc.)

### PR Guidelines

- Clear title and description referencing related issues
- Screenshots for UI changes
- CI must pass before merge
- No breaking changes without prior discussion
- Code coverage must stay the same or improve

---

## Troubleshooting

```bash
# Backend won't start
docker compose logs backend
docker compose restart backend

# Frontend port conflict
VITE_PORT=3000 bun run dev

# Database connection issues
psql -h localhost -p 5433 -U postgres -d app

# Regenerate API client
cd frontend && bun run generate-client

# Tests failing — clear cache
rm -rf node_modules && bun install
```

---

## Quick Command Reference

```bash
# Docker
docker compose up -d
docker compose down
docker compose logs -f
docker compose exec backend bash

# Backend
cd backend && source .venv/bin/activate
fastapi run --reload app/main.py
pytest
alembic upgrade head
mypy app/

# Frontend
cd frontend
bun run dev
bun run build
bun run test
bun run lint

# Database
psql -h localhost -p 5433 -U postgres -d app
alembic revision --autogenerate -m "msg"
alembic upgrade head
```

---

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com)
- [React Documentation](https://react.dev)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Alembic Docs](https://alembic.sqlalchemy.org)
- [Playwright Docs](https://playwright.dev)

---

**Last Updated:** May 1, 2026 **Documentation Version:** 1.0 **Project Status:** Active Development