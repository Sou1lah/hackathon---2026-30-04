# Mobility Hub - Complete Documentation

> [!info] Document Info
> **Version:** 0.1.0  
> **Last Updated:** May 1, 2026  
> **Project:** Full Stack FastAPI & React Application  
> **Status:** Active Development

---

## 📑 Table of Contents

- [[#Project Overview|Project Overview]]
- [[#System Architecture|System Architecture]]
- [[#Technology Stack|Technology Stack]]
- [[#Directory Structure|Directory Structure]]
- [[#Frontend Architecture|Frontend Architecture]]
- [[#Backend Architecture|Backend Architecture]]
- [[#Database Schema|Database Schema]]
- [[#API Endpoints|API Endpoints]]
- [[#Setup Installation|Setup & Installation]]
- [[#Development Workflow|Development Workflow]]
- [[#Deployment Guide|Deployment Guide]]
- [[#Contributing|Contributing]]

---

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

✅ Full-stack authentication (JWT-based)  
✅ Role-based access control (RBAC) with permission flags  
✅ PostgreSQL database with Alembic migrations  
✅ Real-time API documentation with Swagger UI  
✅ Comprehensive E2E testing with Playwright  
✅ Dark mode support  
✅ Email-based password recovery  
✅ Responsive UI with Tailwind CSS & shadcn/ui  
✅ APScheduler for background jobs  
✅ Sentry integration for error tracking  

---

## System Architecture

### High-Level System Architecture

```mermaid
graph TB
    User["👤 User Browser"]
    React["⚛️ React Frontend<br/>Port 5173"]
    Nginx["🔀 Nginx Reverse Proxy<br/>Port 80"]
    FastAPI["⚡ FastAPI Backend<br/>Port 8000"]
    DB["🗄️ PostgreSQL<br/>Port 5432"]
    Cache["💾 Cache<br/>Redis"]
    Jobs["⏰ Background Jobs<br/>APScheduler"]
    
    User -->|HTTP REST| React
    React -->|HTTP API| Nginx
    Nginx -->|Proxy| FastAPI
    FastAPI -->|SQL| DB
    FastAPI --> Cache
    FastAPI --> Jobs
    
    style User fill:#e1f5ff
    style React fill:#f3e5f5
    style FastAPI fill:#e8f5e9
    style DB fill:#fff3e0
    style Nginx fill:#fce4ec
    style Cache fill:#ede7f6
    style Jobs fill:#f1f8e9
```

### Request Flow Diagram

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Frontend as ⚛️ React
    participant API as ⚡ FastAPI
    participant DB as 🗄️ Database
    
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
graph LR
    User["User Input"]
    form["🎨 React Hook Form"]
    zod["✓ Zod Validation"]
    query["🔄 TanStack Query"]
    client["🔗 API Client"]
    api["⚡ Endpoints"]
    crud["📝 CRUD Operations"]
    orm["🔌 SQLModel ORM"]
    db["🗄️ PostgreSQL"]
    
    User -->|Data| form
    form -->|Validate| zod
    zod -->|Fetch| query
    query -->|Call| client
    client -->|HTTP| api
    api -->|Execute| crud
    crud -->|Map| orm
    orm -->|Query| db
    
    style User fill:#e1f5ff
    style form fill:#f3e5f5
    style zod fill:#f3e5f5
    style query fill:#f3e5f5
    style client fill:#e8f5e9
    style api fill:#e8f5e9
    style crud fill:#fff3e0
    style orm fill:#fff3e0
    style db fill:#ff6b6b
```

---

## Technology Stack

### Frontend

| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI Framework | 19.1.1 |
| **TypeScript** | Type Safety | Latest |
| **Vite** | Build Tool & Dev Server | Latest |
| **TanStack Router** | Client-side Routing | 1.163.3 |
| **TanStack Query** | Data Fetching & Caching | 5.90.21 |
| **Tailwind CSS** | Utility-first CSS | 4.1.18 |
| **shadcn/ui** | Accessible Components | Latest |
| **React Hook Form** | Form State Management | 7.68.0 |
| **Zod** | Schema Validation | Latest |
| **axios** | HTTP Client | 1.13.5 |
| **Playwright** | E2E Testing | Latest |
| **Biome** | Linting & Formatting | Latest |

### Backend

| Technology | Purpose | Version |
|-----------|---------|---------|
| **FastAPI** | Web Framework | >=0.114.2 |
| **SQLModel** | ORM + Data Validation | >=0.0.21 |
| **SQLAlchemy** | Database Toolkit | (via SQLModel) |
| **PostgreSQL** | Database | 18 |
| **Alembic** | Database Migrations | >=1.12.1 |
| **Pydantic** | Data Validation | >2.0 |
| **PyJWT** | JWT Authentication | >=2.8.0 |
| **pwdlib** | Password Hashing | >=0.3.0 |
| **APScheduler** | Background Jobs | >=3.10.0 |
| **Sentry** | Error Tracking | >=2.0.0 |
| **BeautifulSoup4** | HTML/XML Parsing | >=4.12.0 |
| **PyPDF** | PDF Processing | >=5.0.0 |
| **Pytest** | Testing Framework | >=7.4.3 |
| **Mypy** | Type Checking | >=1.8.0 |

### Infrastructure

| Technology | Purpose |
|-----------|---------|
| **Docker & Docker Compose** | Containerization & Orchestration |
| **Traefik** | Reverse Proxy / Load Balancer |
| **Mailcatcher** | Local Email Testing |
| **PostgreSQL** | Primary Database |
| **Bun** | JavaScript Package Manager (recommended) |
| **uv** | Python Package Manager |

---

## Directory Structure

```
/home/wael/hackathon/
├── backend/                          # FastAPI Backend Application
│   ├── app/
│   │   ├── __init__.py
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
│   │   ├── utils.py                  # Utility Functions
│   │   ├── initial_data.py           # Database Seeding
│   │   ├── create_admins.py          # Admin Creation Script
│   │   ├── backend_pre_start.py      # Pre-startup Tasks
│   │   ├── tests_pre_start.py        # Test Setup
│   │   │
│   │   ├── api/
│   │   │   ├── main.py               # API Router Setup
│   │   │   ├── deps.py               # Shared Dependencies (DB, Auth)
│   │   │   └── routes/               # API Endpoints
│   │   │       ├── login.py          # Authentication
│   │   │       ├── users.py          # User Management
│   │   │       ├── items.py          # Items CRUD
│   │   │       ├── internships.py    # Internship Management
│   │   │       ├── conventions.py    # Conventions
│   │   │       ├── mobility.py       # Mobility Files
│   │   │       ├── partnerships.py   # Partnerships
│   │   │       ├── pdf.py            # PDF Processing
│   │   │       ├── recommendation.py # Recommendation Engine
│   │   │       ├── suivi_stage.py    # Internship Tracking
│   │   │       ├── offers.py         # Internship Offers
│   │   │       ├── activity_log.py   # Activity Logging
│   │   │       ├── overview.py       # Dashboard Overview
│   │   │       ├── private.py        # Private User Data
│   │   │       └── utils.py          # Route Utilities
│   │   │
│   │   ├── core/
│   │   │   ├── config.py             # Application Settings
│   │   │   ├── db.py                 # Database Connection
│   │   │   ├── security.py           # Authentication & Security
│   │   │   └── scheduler.py          # Background Job Scheduler
│   │   │
│   │   ├── services/
│   │   │   ├── dashboard_service.py  # Dashboard Logic
│   │   │   ├── recommendation.py     # Recommendation Engine
│   │   │   ├── nlp_processor.py      # NLP Processing
│   │   │   ├── pdf_extractor.py      # PDF Extraction
│   │   │   ├── scraper.py            # Web Scraping
│   │   │   └── sync_offers.py        # Offer Synchronization
│   │   │
│   │   ├── email-templates/          # Email Templates
│   │   │   ├── build/
│   │   │   └── src/
│   │   │
│   │   └── alembic/                  # Database Migrations
│   │       ├── env.py
│   │       ├── versions/
│   │       └── script.py.mako
│   │
│   ├── tests/                        # Test Suite
│   │   ├── conftest.py
│   │   ├── api/
│   │   ├── crud/
│   │   ├── scripts/
│   │   └── utils/
│   │
│   ├── scripts/                      # Bash Scripts
│   │   ├── format.sh
│   │   ├── lint.sh
│   │   ├── prestart.sh
│   │   ├── test.sh
│   │   └── tests-start.sh
│   │
│   ├── pyproject.toml                # Python Dependencies
│   ├── alembic.ini                   # Alembic Config
│   ├── Dockerfile                    # Backend Container Image
│   └── README.md                     # Backend Documentation
│
├── frontend/                         # React Frontend Application
│   ├── src/
│   │   ├── main.tsx                  # React Entry Point
│   │   ├── index.css                 # Global Styles
│   │   ├── utils.ts                  # Utility Functions
│   │   ├── routeTree.gen.ts          # Auto-generated Routes
│   │   │
│   │   ├── client/                   # Auto-generated OpenAPI Client
│   │   │   └── (auto-generated from backend OpenAPI schema)
│   │   │
│   │   ├── components/               # React Components
│   │   │   └── (UI components, layouts, forms, etc.)
│   │   │
│   │   ├── hooks/                    # Custom React Hooks
│   │   │   └── (useAuth, useUser, useQuery hooks, etc.)
│   │   │
│   │   ├── lib/                      # Utility Libraries
│   │   │   └── (axios config, theme, helpers)
│   │   │
│   │   └── routes/                   # Route Definitions & Pages
│   │       ├── __root.tsx
│   │       ├── index.tsx
│   │       ├── login.tsx
│   │       ├── admin.tsx
│   │       ├── dashboard.tsx
│   │       └── (more pages)
│   │
│   ├── tests/                        # E2E Tests with Playwright
│   │   ├── auth.setup.ts
│   │   ├── login.spec.ts
│   │   ├── admin.spec.ts
│   │   ├── items.spec.ts
│   │   └── config.ts
│   │
│   ├── public/                       # Static Assets
│   │   └── assets/
│   │
│   ├── package.json                  # Node Dependencies
│   ├── vite.config.ts                # Vite Configuration
│   ├── tsconfig.json                 # TypeScript Config
│   ├── tailwind.config.ts            # Tailwind CSS Config
│   ├── Dockerfile                    # Frontend Production Image
│   ├── Dockerfile.playwright         # Playwright Testing Image
│   ├── playwright.config.ts          # Playwright Config
│   └── README.md                     # Frontend Documentation
│
├── Docker/Infrastructure Files
│   ├── compose.yml                   # Main Docker Compose
│   ├── compose.override.yml          # Development Overrides
│   ├── compose.traefik.yml           # Traefik Configuration
│   ├── nginx.conf                    # Nginx Configuration
│   └── nginx-backend-not-found.conf  # Error Handling
│
├── Root Configuration & Docs
│   ├── copier.yml                    # Project Template Config
│   ├── pyproject.toml                # Root Python Config
│   ├── package.json                  # Root Node Config
│   ├── README.md                     # Main README
│   ├── DOCUMENTATION.md              # This File
│   ├── development.md                # Development Guide
│   ├── deployment.md                 # Deployment Guide
│   ├── CONTRIBUTING.md               # Contributing Guidelines
│   ├── SECURITY.md                   # Security Policy
│   └── release-notes.md              # Release Notes
│
└── Additional Scripts & Helpers
    ├── scripts/
    │   ├── generate-client.sh        # Frontend Client Generation
    │   ├── test.sh                   # Run All Tests
    │   └── test-local.sh             # Local Testing
    │
    └── scratch/                      # Development Scratch Files
        └── (temporary development files)
```

---

## Frontend Architecture

### Overview

The frontend is a modern React 19 application built with TypeScript, Vite, and TanStack ecosystem tools.

### Technology Stack Details

#### Routing (TanStack Router)
- File-based routing system
- Type-safe route definitions
- Nested layouts and layouts
- Built-in search parameter handling

#### State Management
- **TanStack Query (React Query)**: Server state management
  - Automatic caching and synchronization
  - Background refetching
  - Optimistic updates
  
- **React Hook Form**: Client state for forms
  - Minimal re-renders
  - Built-in validation with Zod

#### Component Libraries
- **shadcn/ui**: Accessible, composable components
  - Dialog, Button, Form, Input, Select, etc.
  - Built on Radix UI primitives
  - Fully customizable with Tailwind

- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful icon library
- **Recharts**: Data visualization charts
- **Sonner**: Toast notifications

#### Development Tools
- **Vite**: Lightning-fast dev server with HMR
- **TypeScript**: Full type safety
- **Biome**: Fast linter and formatter
- **Playwright**: E2E testing framework
- **OpenAPI TypeScript Generator**: Auto-generates API client from backend schema

### Key Folders

```
frontend/src/
├── routes/           # Page components & TanStack Router definitions
├── components/       # Reusable UI components
├── hooks/            # Custom React hooks (useAuth, useQuery, etc.)
├── lib/              # Configuration & utilities (axios, theme, helpers)
└── client/           # Auto-generated OpenAPI API client
```

### Component Architecture Example

```
App Root (__root.tsx)
├── Layout Components
│   ├── Navigation/Header
│   ├── Sidebar
│   └── Footer
│
└── Page Routes
    ├── /                    (Dashboard)
    ├── /login               (Authentication)
    ├── /admin               (Admin Panel)
    ├── /dashboard           (User Dashboard)
    ├── /internships         (Internship Listing)
    ├── /conventions         (Convention Management)
    └── (more pages)

Each Page uses:
├── Custom Hooks       (useAuth, useUser, useQuery)
├── TanStack Query     (data fetching & caching)
├── React Hook Form    (form state management)
└── shadcn/ui Components (UI rendering)
```

### API Integration

```typescript
// Auto-generated client from backend OpenAPI schema
import { ApiClient } from '@/client'

const client = new ApiClient()

// Type-safe API calls
const { data: users } = useSuspenseQuery({
  queryKey: ['users'],
  queryFn: () => client.users.getUsersList()
})
```

### Theme & Styling

- **Dark Mode Support**: Integrated with `next-themes`
- **Tailwind CSS**: 
  - Responsive utilities
  - Dark mode variants (dark:)
  - Custom color scheme
- **CSS Variables**: Easy customization of colors and spacing

---

## Backend Architecture

### Overview

FastAPI-based REST API with SQLModel ORM, JWT authentication, and comprehensive business logic.

### Core Structure

#### 1. **API Layer** (`api/`)
- Router-based endpoint organization
- Dependency injection for auth, database, etc.
- Request/response validation with Pydantic

#### 2. **Models Layer** (`models*.py`)
- SQLModel definitions (DB tables + Pydantic schemas)
- Type-safe data structures
- Relationships and constraints

#### 3. **CRUD Layer** (`crud*.py`)
- Database operations (Create, Read, Update, Delete)
- Business logic encapsulation
- Reusable across multiple endpoints

#### 4. **Services Layer** (`services/`)
- Complex business logic
- External integrations (PDF processing, recommendations)
- Background job coordination

#### 5. **Core Layer** (`core/`)
- Configuration management
- Database connection
- Security utilities
- Scheduler initialization

### Request Lifecycle

```
HTTP Request
    ↓
FastAPI Router (api/routes/*.py)
    ↓
Dependency Injection (deps.py)
    - Validate JWT token
    - Get current user
    - Get database session
    ↓
Endpoint Handler
    - Parse request body
    - Call CRUD operations or services
    ↓
CRUD/Service Layer
    - SQLModel ORM interactions
    - Business logic
    ↓
SQLModel ↔ SQLAlchemy ↔ PostgreSQL
    ↓
Response Validation (Pydantic)
    ↓
JSON Response
```

### Authentication Flow

```
User Login
    ↓
POST /api/v1/login
    ↓
Validate email + password (password hashing with pwdlib/argon2)
    ↓
Generate JWT Token (PyJWT)
    ↓
Return access_token
    ↓
Frontend stores token
    ↓
Subsequent requests include "Authorization: Bearer {token}" header
    ↓
Middleware validates token
    ↓
Request proceeds with user context
```

### Key Models

#### User
```python
- id: UUID (Primary Key)
- email: str (Unique, university .univ.dz domain)
- full_name: str
- role: UserRole (student_national, student_international, prof, admin)
- hashed_password: str
- is_active: bool
- is_superuser: bool
- Permission flags: can_access_dashboard, can_apply_internship, etc.
- Profile data: specialty, level, language, gpa
- Activity tracking: last_login_at, total_sessions, engagement_score
- Recommendation features: role_type, mobility_preference, interest_tags
```

#### Item (Template)
```python
- id: UUID
- title: str
- description: str
- owner_id: UUID (FK to User)
- created_at: datetime
```

#### Related Models
- **Internship Request**: Track internship applications and progress
- **Convention**: Management agreements and documents
- **Mobility File**: International mobility documentation
- **Partnership**: University partnerships
- **Recommendation**: Intelligent offer matching
- **Activity Log**: Audit trail of user actions

### Database Migrations (Alembic)

```bash
# Create new migration
alembic revision --autogenerate -m "Add new field"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Background Jobs (APScheduler)

- **Purpose**: Handle async tasks (emails, report generation, data sync)
- **Trigger Types**: Cron, interval-based, one-time
- **Configuration**: `core/scheduler.py`

---

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ ITEM : "owns"
    USER ||--o{ INTERNSHIP_REQUEST : "submits"
    USER ||--o{ CONVENTION : "manages"
    USER ||--o{ MOBILITY_FILE : "manages"
    USER ||--o{ ACTIVITY_LOG_ENTRY : "logs"
    
    INTERNSHIP_REQUEST ||--o{ CONVENTION : "has"
    INTERNSHIP_REQUEST ||--o{ ACTIVITY_LOG_ENTRY : "relates_to"

    USER {
        uuid id PK
        varchar email UK
        varchar full_name
        user_role role
        boolean is_active
        boolean is_superuser
        varchar specialty
        varchar level
        varchar language
        float gpa
        boolean can_access_dashboard
        boolean can_apply_internship
        boolean can_view_convention
        boolean can_view_tracking
        boolean can_review_applications
        text recommendation_score_profile
        string[] interest_tags
        varchar mobility_preference
        timestamptz created_at
        timestamptz updated_at
        timestamptz last_login_at
        int total_sessions
        float engagement_score
        boolean profile_locked
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
        internship_status status
        int progress
        timestamptz created_at
        timestamptz updated_at
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

### Core Tables

#### `user` Table
- Primary key for all user-related operations
- Supports multiple user roles and fine-grained permissions
- Tracks engagement metrics and profile completion
- Stores recommendation system features

#### `item` Table
- Basic CRUD example
- Owner-based access control
- Timestamps for audit trail

#### Specialized Domain Tables
- `internship_request`: Track student internship applications
- `convention`: Formal agreements between university and company
- `mobility_file`: Documentation for international mobility
- `partnership`: University partnership management
- `activity_log`: System audit trail

### Constraints & Indexes

```sql
-- Email uniqueness constraint
ALTER TABLE public.user ADD CONSTRAINT user_email_key UNIQUE (email);

-- Foreign key relationships
ALTER TABLE public.item ADD CONSTRAINT item_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES public.user(id);

-- Indexes for common queries
CREATE INDEX idx_user_email ON public.user(email);
CREATE INDEX idx_item_owner_id ON public.item(owner_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
```

---

## API Endpoints

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Login and get JWT token |
| POST | `/login/access-token` | Refresh access token |
| POST | `/register` | Register new user |
| POST | `/password-recovery/{email}` | Request password reset |
| POST | `/reset-password/` | Reset password with token |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users (admin only) |
| GET | `/users/{user_id}` | Get user by ID |
| POST | `/users` | Create new user (admin) |
| PUT | `/users/{user_id}` | Update user (admin) |
| DELETE | `/users/{user_id}` | Delete user (admin) |
| GET | `/users/me` | Get current user |
| PUT | `/users/me` | Update current user profile |
| POST | `/users/me/password` | Change password |

### Items Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/items` | List all items |
| POST | `/items` | Create new item |
| GET | `/items/{item_id}` | Get item by ID |
| PUT | `/items/{item_id}` | Update item |
| DELETE | `/items/{item_id}` | Delete item |

### Internship Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/internships` | List internships |
| POST | `/internships` | Create internship request |
| GET | `/internships/{id}` | Get internship details |
| PUT | `/internships/{id}` | Update internship |
| DELETE | `/internships/{id}` | Delete internship |
| POST | `/internships/{id}/apply` | Apply to internship |

### Conventions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conventions` | List conventions |
| POST | `/conventions` | Create convention |
| GET | `/conventions/{id}` | Get convention details |
| PUT | `/conventions/{id}` | Update convention |
| DELETE | `/conventions/{id}` | Delete convention |

### Mobility Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/mobility` | List mobility files |
| POST | `/mobility/upload` | Upload mobility file |
| GET | `/mobility/{id}` | Get mobility file |
| DELETE | `/mobility/{id}` | Delete mobility file |

### PDF Processing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/pdf/upload` | Upload and process PDF |
| POST | `/pdf/extract` | Extract data from PDF |
| GET | `/pdf/{id}` | Get PDF metadata |

### Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/recommendations` | Get recommendations for user |
| POST | `/recommendations/process` | Process user interactions |
| GET | `/recommendations/stats` | Get recommendation stats |

### Dashboard & Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/overview` | Get dashboard overview |
| GET | `/overview/stats` | Get system statistics |
| GET | `/activity-logs` | Get activity logs |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |

### API Documentation

**Interactive Swagger UI**: `http://localhost:8000/docs`  
**ReDoc Documentation**: `http://localhost:8000/redoc`  
**OpenAPI JSON Schema**: `http://localhost:8000/api/v1/openapi.json`

---

## Setup & Installation

### Prerequisites

**System Requirements:**
- Docker & Docker Compose (for containerized development)
- OR: Python 3.10+, PostgreSQL 18, Node.js 18+
- Linux/macOS/Windows (WSL2 recommended on Windows)

**Required Tools:**
- `uv` - Python package manager ([install](https://docs.astral.sh/uv/))
- `bun` - JavaScript runtime ([install](https://bun.sh/)) or `npm`/`yarn`

### Option 1: Docker Compose (Recommended)

#### 1. Clone and Navigate to Project
```bash
cd /home/wael/hackathon
```

#### 2. Start Backend & Database
```bash
docker compose up -d proxy db backend prestart
```

What this does:
- **proxy**: Starts Traefik reverse proxy (port 80)
- **db**: Starts PostgreSQL on port 5433 (avoiding conflicts)
- **backend**: Starts FastAPI server on port 8000
- **prestart**: Runs migrations and initial data setup

#### 3. Start Frontend (in another terminal)
```bash
bun install        # Install dependencies
bun run dev        # Start development server
```

Frontend available at: `http://localhost:5173`

#### 4. View API Documentation
```
http://localhost:8000/docs       # Swagger UI
http://localhost:8000/redoc      # ReDoc
```

#### 5. Check Database
```bash
# Connect to PostgreSQL (password in compose.yml)
psql -h localhost -p 5433 -U postgres -d app
```

---

### Option 2: Local Development (Without Docker)

#### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install Python dependencies
uv sync

# Activate virtual environment
source .venv/bin/activate

# Create .env file with database config
cp .env.example .env
# Edit .env: Set DATABASE_URL=postgresql://user:pass@localhost:5432/app

# Set up database
# (Ensure PostgreSQL is running locally)

# Apply migrations
alembic upgrade head

# Run development server
fastapi run --reload app/main.py
```

Backend available at: `http://localhost:8000`

#### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
bun install

# Create .env file if needed
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Start dev server
bun run dev
```

Frontend available at: `http://localhost:5173`

---

### Database Setup

#### Using Docker PostgreSQL

```bash
# Start PostgreSQL container
docker run -d \
  --name postgres \
  -p 5433:5432 \
  -e POSTGRES_PASSWORD=changeme \
  -e POSTGRES_DB=app \
  postgres:18
```

#### Migrations with Alembic

```bash
# Create new migration
cd backend
alembic revision --autogenerate -m "Describe changes"

# Apply migrations
alembic upgrade head

# View migration history
alembic history

# Rollback one migration
alembic downgrade -1
```

---

## Development Workflow

### Code Quality Tools

#### Backend

```bash
cd backend

# Format code
bash scripts/format.sh

# Lint
bash scripts/lint.sh

# Type checking
mypy app/

# Run tests
bash scripts/test.sh

# Test with coverage
coverage run -m pytest && coverage report
```

#### Frontend

```bash
cd frontend

# Format & lint
bun run lint

# Build for production
bun run build

# Preview production build
bun run preview

# Run E2E tests
bun run test

# Run tests with UI
bun run test:ui
```

### Testing

#### Backend Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/api/test_users.py

# Run with verbosity
pytest -vv

# Run specific test function
pytest tests/api/test_users.py::test_create_user

# Run with coverage
pytest --cov=app tests/
```

#### Frontend E2E Tests

```bash
# Run all tests
bun run test

# Run specific test file
bun run test login.spec.ts

# Run in headed mode (see browser)
bun run test --headed

# Generate coverage report
bun run test -- --coverage
```

### Hot Reload Development

#### Backend
```bash
docker compose watch
```
Automatically reloads the backend container when code changes.

#### Frontend
```bash
bun run dev
```
Automatic HMR (Hot Module Replacement) in development.

### Environment Variables

#### Backend `.env`
```env
DATABASE_URL=postgresql://user:password@localhost:5432/app
ENVIRONMENT=local
SENTRY_DSN=
PROJECT_NAME="Mobility Hub"
API_V1_STR=/api/v1
SECRET_KEY=your-secret-key-here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

#### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature-name

# After approval, merge to main
```

---

## Deployment Guide

### Docker Compose Production

```bash
# Build images
docker compose build

# Start with production settings
docker compose -f compose.yml up -d

# Check logs
docker compose logs -f backend
docker compose logs -f frontend
```

### Environment for Production

Create `.env.prod`:
```env
ENVIRONMENT=production
DEBUG=false
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:pass@db-host:5432/app
SECRET_KEY=use-strong-random-key
SENTRY_DSN=your-sentry-dsn
```

### Database Backups

```bash
# Backup PostgreSQL
docker compose exec db pg_dump -U postgres app > backup.sql

# Restore
docker compose exec db psql -U postgres app < backup.sql
```

### Monitoring & Logs

```bash
# View all logs
docker compose logs -f

# View specific service
docker compose logs -f backend

# Filter by time
docker compose logs --since 10m backend
```

### Scaling

Edit `compose.yml`:
```yaml
services:
  backend:
    deploy:
      replicas: 3
```

---

## Contributing

### Code Style

- **Python**: Follow PEP 8, use `ruff` for linting
- **TypeScript**: Follow ESLint config, use `biome` for formatting
- **Commits**: Use conventional commits (feat:, fix:, docs:, etc.)

### Making Changes

1. Create feature branch from `main`
2. Make focused, atomic commits
3. Run tests locally before pushing
4. Create pull request with clear description
5. Wait for CI/CD checks to pass
6. Get code review approval
7. Merge to `main`

### PR Guidelines

- Clear PR title and description
- Reference related issues
- Include screenshots for UI changes
- Ensure CI passes
- Code coverage should improve or stay same
- No breaking changes without discussion

---

## Troubleshooting

### Backend Won't Start
```bash
# Check logs
docker compose logs backend

# Verify database
docker compose logs db

# Restart
docker compose restart backend
```

### Frontend Port Conflict
```bash
# Use different port
VITE_PORT=3000 bun run dev
```

### Database Connection Issues
```bash
# Test connection
psql -h localhost -p 5433 -U postgres -d app

# Check environment variables
cat .env
```

### API Client Generation Failed
```bash
# Regenerate client
cd frontend
bun run generate-client
```

### Tests Failing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
bun install

# Run with debugging
bun run test --debug
```

---

## Additional Resources

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com)
- [React Documentation](https://react.dev)
- [TanStack Router](https://tanstack.com/router)
- [Tailwind CSS](https://tailwindcss.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

### Project Files
- [development.md](./development.md) - Detailed development guide
- [deployment.md](./deployment.md) - Deployment instructions
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contributing guidelines
- [SECURITY.md](./SECURITY.md) - Security policy

### Support
- Create issues in the repository
- Check existing issues and discussions
- Review CI/CD logs for errors

---

## Quick Command Reference

### Docker Compose
```bash
docker compose up -d                    # Start services
docker compose down                     # Stop services
docker compose logs -f                  # View logs
docker compose exec backend bash        # Access container
docker compose restart backend          # Restart service
```

### Backend
```bash
cd backend
source .venv/bin/activate               # Activate venv
fastapi run --reload app/main.py        # Run dev server
pytest                                  # Run tests
alembic upgrade head                    # Run migrations
mypy app/                               # Type check
```

### Frontend
```bash
cd frontend
bun install                             # Install dependencies
bun run dev                             # Start dev server
bun run build                           # Build for production
bun run test                            # Run E2E tests
bun run lint                            # Format & lint
```

### Database
```bash
psql -h localhost -p 5433 -U postgres -d app    # Connect to DB
alembic revision --autogenerate -m "msg"        # Create migration
alembic upgrade head                            # Apply migrations
```

---

**Last Updated:** May 1, 2026  
**Documentation Version:** 1.0  
**Project Status:** Active Development
