# System Architecture & Diagrams

## Complete System Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER'S BROWSER                                 │
│                                                                           │
│  React Application (Localhost:5173)                                      │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  TanStack Router                                                    │ │
│  │  ├── /login          → LoginPage Component                        │ │
│  │  ├── /admin          → AdminDashboard Component                  │ │
│  │  ├── /dashboard      → UserDashboard Component                  │ │
│  │  ├── /internships    → InternshipsPage Component               │ │
│  │  ├── /conventions    → ConventionsPage Component               │ │
│  │  └── /profile        → ProfilePage Component                   │ │
│  │                                                                    │ │
│  │  React Hook Form (Form State)                                     │ │
│  │  ↓                                                                 │ │
│  │  Validation with Zod                                             │ │
│  │  ↓                                                                 │ │
│  │  TanStack Query (Server State)                                    │ │
│  │  ├── Auto-generated API Client (axios)                           │ │
│  │  ├── Caching & Synchronization                                   │ │
│  │  └── Optimistic Updates                                          │ │
│  │      ↓                                                             │ │
│  │  Shadcn/UI Components (UI Rendering)                             │ │
│  │  └── Tailwind CSS (Styling)                                      │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└────────────────────┬─────────────────────────────────────────────────────┘
                     │
                     │ HTTP REST API Calls
                     │ "Authorization: Bearer JWT-TOKEN"
                     │
┌────────────────────▼─────────────────────────────────────────────────────┐
│                     NGINX REVERSE PROXY (Port 80)                         │
│            (Docker Compose: Traefik Proxy, Development)                   │
│                                                                           │
│  Routing: /api/v1/* → Backend Service                                   │
│  Routing: /* → Frontend Service (with fallback)                         │
└────────────────────┬─────────────────────────────────────────────────────┘
                     │
                     │ Proxied Request
                     │
┌────────────────────▼─────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND (Port 8000)                           │
│                                                                           │
│  ┌─ MIDDLEWARE STACK ─────────────────────────────────────────────────┐ │
│  │ 1. CORS Middleware                                                 │ │
│  │    Allow requests from frontend:5173 (development)                 │ │
│  │                                                                    │ │
│  │ 2. Request Logging                                                │ │
│  │    Log all API requests                                           │ │
│  │                                                                    │ │
│  │ 3. Error Handling                                                 │ │
│  │    Catch and format exceptions                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─ ROUTE HANDLERS ──────────────────────────────────────────────────┐ │
│  │                                                                    │ │
│  │  POST /api/v1/login                                              │ │
│  │  ├─ Dependency: get_password_hash()                              │ │
│  │  ├─ Business Logic: verify_password()                            │ │
│  │  └─ Response: { access_token, user }                             │ │
│  │                                                                    │ │
│  │  GET /api/v1/users/me                                            │ │
│  │  ├─ Dependency: get_current_user() [JWT validation]              │ │
│  │  ├─ CRUD: read_user()                                            │ │
│  │  └─ Response: UserPublic schema                                  │ │
│  │                                                                    │ │
│  │  GET /api/v1/items                                               │ │
│  │  ├─ Dependency: get_db(), get_current_user()                     │ │
│  │  ├─ CRUD: read_items()                                           │ │
│  │  └─ Response: [Item] with pagination                             │ │
│  │                                                                    │ │
│  │  POST /api/v1/items                                              │ │
│  │  ├─ Body: ItemCreate schema validation                           │ │
│  │  ├─ CRUD: create_item()                                          │ │
│  │  ├─ Service: (optional) complex business logic                   │ │
│  │  └─ Response: Item with id                                       │ │
│  │                                                                    │ │
│  │  [Additional routes for internships, conventions, mobility...]   │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─ DEPENDENCY INJECTION (deps.py) ──────────────────────────────────┐ │
│  │                                                                    │ │
│  │  get_db() → Session                                              │ │
│  │  └─ Yields SQLAlchemy session for each request                   │ │
│  │                                                                    │ │
│  │  get_current_user() → User                                       │ │
│  │  ├─ Extracts Bearer token from header                            │ │
│  │  ├─ Decodes JWT with SECRET_KEY                                  │ │
│  │  ├─ Validates token expiry                                       │ │
│  │  └─ Returns authenticated User object                            │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─ CRUD LAYER (crud*.py) ───────────────────────────────────────────┐ │
│  │                                                                    │ │
│  │  def create_user(db: Session, user: UserCreate) → User           │ │
│  │  def read_user(db: Session, user_id: UUID) → User | None         │ │
│  │  def update_user(db: Session, user_id: UUID, ...) → User         │ │
│  │  def delete_user(db: Session, user_id: UUID) → bool              │ │
│  │                                                                    │ │
│  │  [Similar functions for Items, Internships, etc.]                │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─ SERVICES LAYER (services/) ──────────────────────────────────────┐ │
│  │                                                                    │ │
│  │  recommendation.py                                                │ │
│  │  ├─ generate_recommendations(user_id)                            │ │
│  │  ├─ Calculate match scores with internship offers                │ │
│  │  └─ Update recommendation_score_profile in User                  │ │
│  │                                                                    │ │
│  │  pdf_extractor.py                                                │ │
│  │  ├─ extract_text_from_pdf(file_path)                             │ │
│  │  └─ Parse PDF documents for internship data                      │ │
│  │                                                                    │ │
│  │  dashboard_service.py                                            │ │
│  │  ├─ get_user_stats()                                             │ │
│  │  ├─ get_admin_stats()                                            │ │
│  │  └─ Aggregate data for dashboard views                           │ │
│  │                                                                    │ │
│  │  scraper.py                                                       │ │
│  │  ├─ scrape_internship_offers()                                   │ │
│  │  └─ Fetch offers from external sources (if configured)           │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─ MODELS (models*.py) ─────────────────────────────────────────────┐ │
│  │                                                                    │ │
│  │  SQLModel Classes (Database Tables + Pydantic Schemas)           │ │
│  │  ├─ User (table=True)                                            │ │
│  │  │  ├─ id, email, hashed_password, ...                          │ │
│  │  │  ├─ Relationships: items[], activity_logs[]                  │ │
│  │  │  └─ Permission flags: can_access_dashboard, ...              │ │
│  │  │                                                               │ │
│  │  ├─ Item (table=True)                                           │ │
│  │  │  ├─ id, title, description, owner_id                        │ │
│  │  │  └─ Relationship: owner (User)                               │ │
│  │  │                                                               │ │
│  │  ├─ InternshipRequest (table=True)                              │ │
│  │  ├─ Convention (table=True)                                     │ │
│  │  ├─ MobilityFile (table=True)                                   │ │
│  │  └─ ActivityLogEntry (table=True)                               │ │
│  │                                                                    │ │
│  │  Request/Response Schemas (no table=True)                        │ │
│  │  ├─ UserCreate, UserUpdate, UserPublic                          │ │
│  │  ├─ ItemCreate, ItemUpdate                                      │ │
│  │  └─ [Other DTO schemas]                                         │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─ CONFIGURATION (core/config.py) ──────────────────────────────────┐ │
│  │                                                                    │ │
│  │  Pydantic Settings (env vars)                                    │ │
│  │  ├─ PROJECT_NAME = "Mobility Hub"                                │ │
│  │  ├─ API_V1_STR = "/api/v1"                                       │ │
│  │  ├─ DATABASE_URL = "postgresql://..."                            │ │
│  │  ├─ SECRET_KEY = "your-secret-key"                               │ │
│  │  └─ ENVIRONMENT = "local" | "production"                         │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─ DATABASE CONNECTION (core/db.py) ────────────────────────────────┐ │
│  │                                                                    │ │
│  │  engine = create_engine(DATABASE_URL)                            │ │
│  │  SessionLocal = sessionmaker(bind=engine)                        │ │
│  │  Lifespan Context: Start/Stop Scheduler                          │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─ SCHEDULER (core/scheduler.py) ───────────────────────────────────┐ │
│  │                                                                    │ │
│  │  APScheduler Background Jobs:                                    │ │
│  │  ├─ Periodic: sync_internship_offers() every 6 hours            │ │
│  │  ├─ Cron: generate_monthly_reports() at 00:00 on 1st            │ │
│  │  └─ Interval: process_pending_recommendations() every 30min     │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
└────────────────────────┬─────────────────────────────────────────────────┘
                         │
                         │ SQL Queries (SQLAlchemy ORM)
                         │
┌────────────────────────▼─────────────────────────────────────────────────┐
│                     POSTGRESQL DATABASE (Port 5432)                       │
│                    (Docker Compose: Port 5433 mapped)                     │
│                                                                           │
│  ┌─ TABLES ──────────────────────────────────────────────────────────┐ │
│  │                                                                    │ │
│  │  user                                                             │ │
│  │  ├─ PRIMARY KEY: id (UUID)                                       │ │
│  │  ├─ UNIQUE: email                                                │ │
│  │  ├─ INDEXES: email, created_at, role                             │ │
│  │  └─ CHECK: email LIKE '%.univ.dz'                                │ │
│  │                                                                    │ │
│  │  item                                                             │ │
│  │  ├─ PRIMARY KEY: id (UUID)                                       │ │
│  │  ├─ FOREIGN KEY: owner_id → user(id)                             │ │
│  │  └─ INDEX: owner_id                                              │ │
│  │                                                                    │ │
│  │  internship_request                                              │ │
│  │  ├─ PRIMARY KEY: id (UUID)                                       │ │
│  │  ├─ FOREIGN KEY: student_id → user(id)                           │ │
│  │  ├─ STATUS: enum (draft, submitted, reviewing, approved, ...)   │ │
│  │  └─ INDEXES: student_id, status, created_at                     │ │
│  │                                                                    │ │
│  │  activity_log_entry                                              │ │
│  │  ├─ PRIMARY KEY: id (UUID)                                       │ │
│  │  ├─ FOREIGN KEY: user_id → user(id)                              │ │
│  │  ├─ ACTION_TYPE: enum                                            │ │
│  │  └─ COLUMN: details (JSONB for extensibility)                    │ │
│  │                                                                    │ │
│  │  [Additional tables: convention, mobility_file, partnership...]  │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─ VIEWS (Optional) ────────────────────────────────────────────────┐ │
│  │                                                                    │ │
│  │  user_stats                                                       │ │
│  │  ├─ user_id, total_items, last_item_date, ...                    │ │
│  │  └─ Used for dashboard queries                                   │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─ MIGRATIONS (alembic/versions/) ──────────────────────────────────┐ │
│  │                                                                    │ │
│  │  001_initial_migration.py                                        │ │
│  │  002_add_permission_flags.py                                     │ │
│  │  003_add_activity_log.py                                         │ │
│  │  ...                                                              │ │
│  │                                                                    │ │
│  │  Each migration has:                                             │ │
│  │  ├─ upgrade() - apply changes                                    │ │
│  │  └─ downgrade() - rollback changes                               │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘


                         ▼ (Optional)

┌─────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                                   │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │                  │  │                  │  │                  │      │
│  │  Sentry          │  │  Email Service   │  │  PDF Processing  │      │
│  │  (Error Track)   │  │  (SMTP/SendGrid) │  │  (PyPDF)         │      │
│  │                  │  │                  │  │                  │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: User Registration & Authentication

```
┌─────────────────────────────────────────────────────────────────────┐
│ USER REGISTRATION FLOW                                              │
└─────────────────────────────────────────────────────────────────────┘

1. FRONTEND: User fills registration form
   └─ Email: student@univ.dz
   └─ Password: ••••••••
   └─ Full Name: Ali Ahmed
   └─ Role: student_national

   React Hook Form (client-side validation)
   └─ Email format check
   └─ Password length (min 8 chars)
   └─ Required fields validation

2. FRONTEND: Submit form via API
   POST /api/v1/register
   Body: {
     "email": "student@univ.dz",
     "password": "securepassword123",
     "full_name": "Ali Ahmed",
     "role": "student_national"
   }

3. BACKEND: Receive at /api/v1/register endpoint
   
   UserRegister Schema Validation
   └─ Pydantic validates request body
   └─ Custom validator: email.endswith(.univ.dz)
   └─ Email format validation via EmailStr

4. BACKEND: CRUD - Create User
   
   create_user(db: Session, user: UserCreate) → User
   
   ├─ Hash password using pwdlib with Argon2
   │  └─ user.hashed_password = hash_password(user.password)
   │
   ├─ Check email uniqueness
   │  └─ db.query(User).filter(User.email == email).first()
   │
   ├─ Create User instance (ORM)
   │  └─ new_user = User(
   │      id=uuid.uuid4(),
   │      email=user.email,
   │      hashed_password=hashed_password,
   │      full_name=user.full_name,
   │      role=UserRole.student_national,
   │      is_active=True,
   │      created_at=get_datetime_utc(),
   │      ...
   │    )
   │
   ├─ Insert into database
   │  └─ db.add(new_user)
   │  └─ db.commit()
   │  └─ db.refresh(new_user)
   │
   └─ Return User object

5. BACKEND: Send response
   HTTP 200 OK
   {
     "id": "550e8400-e29b-41d4-a716-446655440000",
     "email": "student@univ.dz",
     "full_name": "Ali Ahmed",
     "role": "student_national",
     "is_active": true,
     ...
   }

6. FRONTEND: Handle response
   └─ Store success message
   └─ Redirect to login page


┌─────────────────────────────────────────────────────────────────────┐
│ USER LOGIN FLOW (JWT Authentication)                               │
└─────────────────────────────────────────────────────────────────────┘

1. FRONTEND: User enters credentials
   └─ Email: student@univ.dz
   └─ Password: securepassword123

2. FRONTEND: Submit login form
   POST /api/v1/login
   
   Headers: Content-Type: application/x-www-form-urlencoded
   Body: username={email}&password={password}

3. BACKEND: Receive at login endpoint
   
   FastAPI SecurityScopes validation
   └─ Dependency: oauth2_scheme extracts Bearer token (if present)

4. BACKEND: Verify credentials
   
   ├─ Fetch user from database
   │  └─ user = db.query(User).filter(User.email == email).first()
   │
   ├─ Check if user exists
   │  └─ if not user: raise credentialsException
   │
   ├─ Verify password
   │  └─ pwd_context.verify(password, user.hashed_password)
   │  └─ if not verified: raise credentialsException
   │
   └─ Check if user is active
      └─ if not user.is_active: raise credentialsException

5. BACKEND: Generate JWT Token
   
   token_payload = {
     "sub": str(user.id),           # subject (user ID)
     "iat": datetime.now(timezone.utc),  # issued at
     "exp": datetime.now(timezone.utc) + timedelta(minutes=30),  # expires
     "type": "access"
   }
   
   access_token = jwt.encode(
     token_payload,
     setting.SECRET_KEY,
     algorithm="HS256"
   )

6. BACKEND: Send response
   HTTP 200 OK
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "token_type": "bearer",
     "user": {
       "id": "550e8400-e29b-41d4-a716-446655440000",
       "email": "student@univ.dz",
       ...
     }
   }

7. FRONTEND: Store token
   └─ localStorage.setItem('access_token', token)
   └─ Update auth state (TanStack Query)
   └─ Redirect to dashboard

8. FRONTEND: Make authenticated request
   GET /api/v1/users/me
   
   Headers: {
     "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }

9. BACKEND: Validate token (get_current_user dependency)
   
   ├─ Extract token from Authorization header
   │  └─ scheme, token = header.split(" ")
   │
   ├─ Decode JWT token
   │  └─ payload = jwt.decode(token, SECRET_KEY, algorithms="HS256")
   │
   ├─ Verify token expiration
   │  └─ if exp < now(): raise credentialsException
   │
   ├─ Extract user ID from payload
   │  └─ user_id = payload.get("sub")
   │
   ├─ Fetch user from database
   │  └─ user = db.query(User).filter(User.id == user_id).first()
   │
   └─ Return authenticated user
      └─ FastAPI injects into endpoint as current_user parameter

10. BACKEND: Access protected resource
    
    GET /api/v1/users/me
    
    @router.get("/users/me", response_model=UserPublic)
    def read_user_me(current_user: User = Depends(get_current_user)) → UserPublic:
        └─ current_user is now available (already authenticated)
        └─ return UserPublic.from_orm(current_user)

11. FRONTEND: Display protected content
    └─ User profile loaded
    └─ Dashboard accessible
```

---

## Complete Component Hierarchy (Frontend)

```
App Root
│
├─ AuthProvider
│  └─ Handles login/logout state
│  └─ JWT token management
│  └─ useAuth hook available
│
├─ TanStack Router
│  │
│  ├─ Layout Route (__root.tsx)
│  │  ├─ Header/Navigation
│  │  ├─ Sidebar (conditional)
│  │  └─ Main Content Outlet
│  │
│  ├─ /login (public)
│  │  └─ LoginPage
│  │     ├─ LoginForm (React Hook Form)
│  │     │  └─ Email & Password Input
│  │     │  └─ Submit Button
│  │     └─ useMutation (POST /login)
│  │
│  ├─ /register (public)
│  │  └─ RegisterPage
│  │     ├─ RegistrationForm
│  │     └─ useMutation (POST /register)
│  │
│  ├─ /dashboard (protected)
│  │  ├─ DashboardLayout
│  │  │  ├─ Sidebar Navigation
│  │  │  └─ Main Content
│  │  │
│  │  ├─ /items (ItemsPage)
│  │  │  ├─ DataTable (TanStack Table)
│  │  │  │  ├─ Sorting
│  │  │  │  ├─ Filtering
│  │  │  │  └─ Pagination
│  │  │  ├─ useQuery (GET /items)
│  │  │  ├─ CreateItemDialog
│  │  │  │  └─ ItemForm (React Hook Form)
│  │  │  │     └─ useMutation (POST /items)
│  │  │  └─ EditItemDialog
│  │  │     └─ ItemForm (prefilled)
│  │  │        └─ useMutation (PUT /items/{id})
│  │  │
│  │  ├─ /internships
│  │  │  ├─ InternshipsPage
│  │  │  ├─ InternshipsList (with cards)
│  │  │  ├─ InternshipDetails (modal/drawer)
│  │  │  └─ ApplyForm (conditional based on role)
│  │  │
│  │  ├─ /conventions
│  │  │  ├─ ConventionsPage
│  │  │  ├─ ConventionsList
│  │  │  └─ ConventionViewer (PDF viewer)
│  │  │
│  │  ├─ /profile
│  │  │  └─ ProfilePage
│  │  │     ├─ ProfileForm (React Hook Form)
│  │  │     │  ├─ Basic Info
│  │  │     │  ├─ Specialization
│  │  │     │  └─ Preferences
│  │  │     └─ useMutation (PUT /users/me)
│  │  │
│  │  └─ /settings
│  │     ├─ SettingsPage
│  │     ├─ PasswordChangeForm
│  │     └─ PreferencesForm
│  │
│  └─ /admin (protected, admin only)
│     ├─ AdminLayout
│     ├─ /users
│     │  └─ UsersManagementPage
│     │     ├─ UsersTable (TanStack Table)
│     │     ├─ CreateUserDialog
│     │     ├─ EditUserDialog
│     │     └─ DeleteUserDialog
│     │
│     ├─ /applications
│     │  └─ ApplicationsPage
│     │     ├─ ApplicationsList (filter by status)
│     │     ├─ ReviewApplicationModal
│     │     └─ useMutation (PUT /internships/{id}/review)
│     │
│     └─ /reports
│        └─ ReportsPage
│           ├─ StatsChart (Recharts)
│           ├─ ActivityLog
│           └─ useQuery (GET /activity-logs)
│
└─ Global Providers
   ├─ Theme Provider (next-themes)
   ├─ TanStack Query Client Provider
   ├─ React Router Provider
   └─ Toast Provider (Sonner)
```

---

## API Response Lifecycle

```
REQUEST:  POST /api/v1/items
          Headers: Authorization: Bearer {token}
          Body: { "title": "New Item", "description": "..." }

                    ↓

MIDDLEWARE STACK:
  1. CORSMiddleware - Check origin ✓
  2. RequestLogging - Log incoming request
  3. ErrorHandling - Prepare error handlers

                    ↓

ROUTE MATCHING:
  /api/v1/items → routes/items.py::create_item()

                    ↓

DEPENDENCY INJECTION:
  ├─ get_db() → SQLAlchemy Session
  ├─ get_current_user() → User (JWT validated)
  └─ (Validation fails if token missing/expired)

                    ↓

REQUEST VALIDATION:
  ItemCreate schema validation:
  ├─ title: str (min_length=1, max_length=255) ✓
  ├─ description: str | None ✓

                    ↓

ENDPOINT HANDLER:
  @router.post("/items", response_model=Item)
  async def create_item(
    *,
    session: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    item_in: ItemCreate,
  ) → Item:
  
  ├─ Extract data: item_in.title, item_in.description
  ├─ Call CRUD: create_item_db = crud.create_item(db=session, ...)
  └─ Return item object

                    ↓

CRUD OPERATION:
  def create_item(db: Session, item_in: ItemCreate, owner_id: UUID) → Item:
  
  ├─ Create ORM instance:
  │  db_item = Item(
  │    id=uuid.uuid4(),
  │    title=item_in.title,
  │    description=item_in.description,
  │    owner_id=owner_id,
  │    created_at=datetime.now(timezone.utc)
  │  )
  │
  ├─ Add to session: db.add(db_item)
  ├─ Commit transaction: db.commit()
  ├─ Refresh: db.refresh(db_item)
  └─ Return: db_item

                    ↓

DATABASE OPERATION:
  PostgreSQL receives:
  INSERT INTO item (id, title, description, owner_id, created_at)
  VALUES (uuid, 'New Item', '...', owner_uuid, now())
  RETURNING *;

                    ↓

RESPONSE SERIALIZATION:
  Item model (response_model=Item) serializes to JSON:
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "New Item",
    "description": "...",
    "owner_id": "650e8400-e29b-41d4-a716-446655440011",
    "created_at": "2026-05-01T10:30:00Z"
  }

                    ↓

HTTP RESPONSE:
  Status: 201 Created
  Headers: Content-Type: application/json
  Body: { ... JSON above ... }

                    ↓

FRONTEND (TanStack Query):
  ├─ Receive response
  ├─ Update cache with new item
  ├─ Re-render components using the items query
  └─ Show success toast: "Item created successfully"

                    ↓

UI UPDATE:
  ItemsList component's useQuery data updates
  └─ Table/list re-renders with new item
```

---

## File Upload Flow (Example: PDF Upload)

```
FRONTEND:
  User selects PDF file
  │
  ├─ File validation (type, size)
  └─ Create FormData:
     const formData = new FormData()
     formData.append('file', file)

  POST /api/v1/pdf/upload
  Headers: Content-Type: multipart/form-data

                    ↓

BACKEND (routes/pdf.py):
  @router.post("/pdf/upload")
  async def upload_pdf(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
  ):
  
  ├─ Validate file type
  │  if file.content_type not in ['application/pdf']:
  │    raise HTTPException(400, "Invalid file type")
  │
  ├─ Validate file size (max 10MB)
  │  contents = await file.read()
  │  if len(contents) > 10 * 1024 * 1024:
  │    raise HTTPException(413, "File too large")
  │
  ├─ Generate unique filename
  │  unique_filename = f"{uuid.uuid4()}_{file.filename}"
  │
  ├─ Save to disk
  │  save_path = f"/uploads/pdfs/{unique_filename}"
  │  with open(save_path, 'wb') as f:
  │    f.write(contents)
  │
  ├─ Call service: pdf_extractor.extract_text_from_pdf()
  │  extracted_text = extract_text_from_pdf(save_path)
  │  extracted_data = parse_internship_data(extracted_text)
  │
  ├─ Store metadata in database
  │  pdf_doc = PDFDocument(
  │    id=uuid.uuid4(),
  │    user_id=current_user.id,
  │    file_name=file.filename,
  │    file_path=save_path,
  │    extracted_data=extracted_data,
  │    created_at=datetime.now()
  │  )
  │  db.add(pdf_doc)
  │  db.commit()
  │
  └─ Return: { "id": pdf_doc.id, "extracted_data": {...} }

                    ↓

FRONTEND (TanStack Query):
  Response received:
  {
    "id": "pdf-uuid-123",
    "extracted_data": {
      "company_name": "...",
      "internship_title": "...",
      "start_date": "..."
    }
  }
  
  └─ Update UI with extracted data preview
  └─ Show success notification
```
