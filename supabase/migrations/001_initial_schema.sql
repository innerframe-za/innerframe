-- Innerframe Care Solutions — Initial Schema
-- Apply in Supabase SQL editor or via supabase db push

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- organisations — one row per subscribed old age home
-- ----------------------------------------------------------------
CREATE TABLE organisations (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT        NOT NULL,
  address       TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  logo_url      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- users — portal staff members, linked to auth.users
-- ----------------------------------------------------------------
CREATE TABLE users (
  id         UUID  PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id     UUID  NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  full_name  TEXT  NOT NULL,
  email      TEXT  NOT NULL,
  role       TEXT  NOT NULL CHECK (role IN ('home_admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- patients — residents of each facility
-- ----------------------------------------------------------------
CREATE TABLE patients (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id         UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  full_name      TEXT NOT NULL,
  date_of_birth  DATE,
  id_number      TEXT,
  room_number    TEXT,
  admission_date DATE,
  status         TEXT DEFAULT 'active'
                      CHECK (status IN ('active', 'discharged', 'deceased')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- document_categories — facility-specific category labels
-- ----------------------------------------------------------------
CREATE TABLE document_categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id     UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- document_sections — groupings within each pillar
-- is_global = true  → created by Innerframe, visible to all orgs
-- is_global = false → org-specific section
-- ----------------------------------------------------------------
CREATE TABLE document_sections (
  id         UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  pillar     TEXT    NOT NULL
             CHECK (pillar IN ('admin', 'finance', 'kitchen', 'medical', 'board_governance')),
  title      TEXT    NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_global  BOOLEAN DEFAULT FALSE,
  org_id     UUID    REFERENCES organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- documents — files uploaded to Supabase Storage
-- is_global = true  → added by Innerframe, immutable by facility staff
-- ----------------------------------------------------------------
CREATE TABLE documents (
  id            UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID    NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  patient_id    UUID    REFERENCES patients(id) ON DELETE SET NULL,
  category_id   UUID    REFERENCES document_categories(id) ON DELETE SET NULL,
  section_id    UUID    REFERENCES document_sections(id) ON DELETE SET NULL,
  pillar        TEXT    NOT NULL
                CHECK (pillar IN ('admin', 'finance', 'kitchen', 'medical', 'board_governance')),
  file_name     TEXT    NOT NULL,
  file_url      TEXT    NOT NULL,
  uploaded_by   UUID    REFERENCES users(id) ON DELETE SET NULL,
  is_global     BOOLEAN DEFAULT FALSE,
  -- Full-text search vector generated from file_name
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', file_name)) STORED,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- GIN index enables fast full-text search on documents
CREATE INDEX documents_search_idx ON documents USING GIN (search_vector);

-- ----------------------------------------------------------------
-- audit_logs — immutable record of all portal actions
-- ----------------------------------------------------------------
CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id       UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,
  target_table TEXT,
  target_id    UUID,
  timestamp    TIMESTAMPTZ DEFAULT NOW()
);
