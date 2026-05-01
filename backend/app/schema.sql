-- ============================================================
-- Mobility Hub — Complete Database Schema (PostgreSQL 18)
-- Generated from SQLModel definitions in:
--   backend/app/models.py
--   backend/app/models_mobility.py
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM (
    'student_national',
    'student_international',
    'prof_national',
    'prof_international',
    'admin'
);

CREATE TYPE internship_status AS ENUM (
    'draft',
    'pending_verification',
    'pending_signature',
    'active',
    'completed',
    'blocked'
);

CREATE TYPE verification_status AS ENUM (
    'idle',
    'checking',
    'verified',
    'failed'
);

CREATE TYPE mobility_type AS ENUM (
    'nationale',
    'internationale'
);

CREATE TYPE approval_level AS ENUM (
    'N1',
    'N2',
    'N3'
);

CREATE TYPE priority_level AS ENUM (
    'Low',
    'Medium',
    'High',
    'Critical'
);

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- -------------------------------------------------------
-- 2a. User — Authentication, profile, and role management
-- -------------------------------------------------------
-- Passwords are stored as Argon2id / bcrypt hashes via pwdlib.
-- Auth tokens are stateless JWTs (HS256) — no server-side
-- session table is needed.
-- Account deletion is a hard delete (CASCADE to owned rows).
-- -------------------------------------------------------
CREATE TABLE "user" (
    id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255)  UNIQUE NOT NULL,
    full_name       VARCHAR(255),
    hashed_password TEXT          NOT NULL,
    role            user_role     NOT NULL DEFAULT 'student_national',
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    is_superuser    BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_email ON "user"(email);

-- -------------------------------------------------------
-- 2b. Item — Generic owner-scoped items
-- -------------------------------------------------------
CREATE TABLE "item" (
    id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       VARCHAR(255)  NOT NULL,
    description VARCHAR(255),
    owner_id    UUID          NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_item_owner_id ON "item"(owner_id);

-- ============================================================
-- 3. MOBILITY & INTERNSHIP TABLES
-- ============================================================

-- -------------------------------------------------------
-- 3a. InternshipRequest — Full lifecycle PFE management
-- -------------------------------------------------------
CREATE TABLE internshiprequest (
    id                    UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_name          VARCHAR(255)        NOT NULL,
    registration_number   VARCHAR(50)         NOT NULL,
    email                 VARCHAR(255),
    birth_date            DATE,
    company_name          VARCHAR(255),
    company_address       VARCHAR(500),
    mission_title         VARCHAR(255),
    mission_description   VARCHAR(2000),
    start_date            DATE,
    end_date              DATE,
    status                internship_status   NOT NULL DEFAULT 'draft',
    verification_status   verification_status NOT NULL DEFAULT 'idle',
    progress              INTEGER             NOT NULL DEFAULT 0
                              CHECK (progress >= 0 AND progress <= 100),
    owner_id              UUID                NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at            TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_internship_owner_id ON internshiprequest(owner_id);
CREATE INDEX idx_internship_status   ON internshiprequest(status);

-- -------------------------------------------------------
-- 3b. Convention — 8-step signature workflow documents
-- -------------------------------------------------------
CREATE TABLE convention (
    id                    UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    internship_request_id UUID          NOT NULL REFERENCES internshiprequest(id) ON DELETE CASCADE,
    owner_id              UUID          NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    document_name         VARCHAR(255)  NOT NULL,
    signature_step        INTEGER       NOT NULL DEFAULT 1
                              CHECK (signature_step >= 1 AND signature_step <= 8),
    status                VARCHAR(50)   NOT NULL DEFAULT 'pending',
    created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_convention_internship_id ON convention(internship_request_id);
CREATE INDEX idx_convention_owner_id      ON convention(owner_id);

-- -------------------------------------------------------
-- 3c. MobilityFile — National/international mobility tracking
-- -------------------------------------------------------
CREATE TABLE mobilityfile (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_code  VARCHAR(20)     NOT NULL,
    student_name    VARCHAR(255)    NOT NULL,
    destination     VARCHAR(500)    NOT NULL,
    mobility_type   mobility_type   NOT NULL,
    approval_level  approval_level  NOT NULL DEFAULT 'N1',
    priority        priority_level  NOT NULL DEFAULT 'Medium',
    tags            VARCHAR(500)    DEFAULT '',
    status          VARCHAR(50)     NOT NULL DEFAULT 'pending',
    owner_id        UUID            NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mobility_owner_id ON mobilityfile(owner_id);
CREATE INDEX idx_mobility_type     ON mobilityfile(mobility_type);

-- -------------------------------------------------------
-- 3d. ActivityLogEntry — Daily internship activity journal
-- -------------------------------------------------------
CREATE TABLE activitylogentry (
    id                    UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    internship_request_id UUID          NOT NULL REFERENCES internshiprequest(id) ON DELETE CASCADE,
    owner_id              UUID          NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "date"                DATE          NOT NULL,
    content               VARCHAR(2000) NOT NULL,
    hours                 INTEGER       NOT NULL CHECK (hours >= 0 AND hours <= 24),
    created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_log_internship_id ON activitylogentry(internship_request_id);
CREATE INDEX idx_activity_log_owner_id      ON activitylogentry(owner_id);
