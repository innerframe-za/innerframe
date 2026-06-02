-- Multi-tenant core tables: facilities, profiles, facility_memberships,
-- contacts, documents (new schema), audit_log, dashboard_widgets, activity_feed.
-- All statements use IF NOT EXISTS for idempotent re-runs.
-- Depends on: 011_types.sql

-- ----------------------------------------------------------------
-- facilities — tenant anchor (replaces organisations going forward)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS facilities (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT        NOT NULL,
  slug              TEXT        UNIQUE NOT NULL,
  facility_type     TEXT,
  subscription_tier TEXT        NOT NULL DEFAULT 'standard',
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- profiles — one per auth user; mirrors auth.users
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  email      TEXT        UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create a profiles row when a new auth user signs up.
-- Uses a distinct function name so it does not collide with the
-- existing handle_new_auth_user trigger that creates public.users rows.
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_profile_created ON auth.users;
CREATE TRIGGER on_auth_user_profile_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();

-- Backfill profiles for users that already exist in public.users
INSERT INTO profiles (id, email, full_name, created_at)
SELECT u.id, u.email, u.full_name, u.created_at
FROM users u
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- facility_memberships — user ↔ facility with per-module permissions
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS facility_memberships (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id       UUID            NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  user_id           UUID            NOT NULL REFERENCES profiles(id)   ON DELETE CASCADE,
  role              TEXT            NOT NULL CHECK (role IN (
                                      'super_admin',
                                      'facility_admin',
                                      'hr_manager',
                                      'finance_officer',
                                      'medical_staff',
                                      'board_member',
                                      'kitchen_staff',
                                      'general_staff'
                                    )),

  -- Per-module permissions — can be overridden by facility_admin after creation
  perm_admin        permission_level NOT NULL DEFAULT 'none',
  perm_staff        permission_level NOT NULL DEFAULT 'none',
  perm_hr           permission_level NOT NULL DEFAULT 'none',
  perm_board        permission_level NOT NULL DEFAULT 'none',
  perm_residence    permission_level NOT NULL DEFAULT 'none',
  perm_finance      permission_level NOT NULL DEFAULT 'none',
  perm_kitchen      permission_level NOT NULL DEFAULT 'none',
  perm_medical      permission_level NOT NULL DEFAULT 'none',

  status            TEXT            NOT NULL DEFAULT 'active'
                                    CHECK (status IN ('active', 'inactive', 'suspended')),
  invited_by        UUID            REFERENCES profiles(id),
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT now(),

  UNIQUE (facility_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_user
  ON facility_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_facility
  ON facility_memberships(facility_id);
CREATE INDEX IF NOT EXISTS idx_memberships_facility_user
  ON facility_memberships(facility_id, user_id);

-- ----------------------------------------------------------------
-- contacts — CRM table (residents, donors, volunteers, suppliers …)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id   UUID        NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  contact_type  TEXT        NOT NULL CHECK (contact_type IN (
                              'resident', 'client', 'donor', 'volunteer', 'supplier', 'other'
                            )),
  full_name     TEXT        NOT NULL,
  email         TEXT,
  phone         TEXT,
  metadata      JSONB       NOT NULL DEFAULT '{}',
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_by    UUID        REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contacts_facility
  ON contacts(facility_id);
CREATE INDEX IF NOT EXISTS idx_contacts_facility_name
  ON contacts(facility_id, full_name text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_contacts_metadata
  ON contacts USING GIN(metadata jsonb_path_ops);

-- ----------------------------------------------------------------
-- Rename old documents table if it still has the legacy file_url schema.
-- ON DELETE RESTRICT is used on the new table so deleting a facility
-- does not silently wipe its documents — deactivate via is_active instead.
-- ----------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'documents'
      AND column_name  = 'file_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name   = 'documents_legacy'
  ) THEN
    ALTER TABLE documents RENAME TO documents_legacy;
  END IF;
END
$$;

-- documents — metadata only; actual files live in Supabase Storage
CREATE TABLE IF NOT EXISTS documents (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id   UUID        NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  module        app_module  NOT NULL,
  contact_id    UUID        REFERENCES contacts(id) ON DELETE SET NULL,
  title         TEXT        NOT NULL,
  tags          TEXT[]      NOT NULL DEFAULT '{}',
  storage_path  TEXT        NOT NULL,   -- full path in the documents bucket
  mime_type     TEXT,
  file_size     BIGINT,
  uploaded_by   UUID        NOT NULL REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_facility
  ON documents(facility_id);
CREATE INDEX IF NOT EXISTS idx_documents_facility_module
  ON documents(facility_id, module);
CREATE INDEX IF NOT EXISTS idx_documents_facility_time
  ON documents(facility_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_tags
  ON documents USING GIN(tags);

-- ----------------------------------------------------------------
-- audit_log — append-only; separate from legacy audit_logs table
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGSERIAL   PRIMARY KEY,
  facility_id UUID        NOT NULL,   -- denormalised intentionally
  user_id     UUID,
  action      TEXT        NOT NULL,   -- CREATE | UPDATE | DELETE | VIEW | PERMISSION_CHANGE | LOGIN
  module      app_module,
  table_name  TEXT        NOT NULL,
  record_id   UUID,
  old_values  JSONB,
  new_values  JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_facility_time
  ON audit_log(facility_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_facility_user
  ON audit_log(facility_id, user_id, created_at DESC);

-- ----------------------------------------------------------------
-- dashboard_widgets — per-facility configurable tiles
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID        NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  module      app_module  NOT NULL,
  widget_type TEXT        NOT NULL,   -- counter | chart | list | calendar
  title       TEXT        NOT NULL,
  config      JSONB       NOT NULL DEFAULT '{}',
  position    INTEGER     NOT NULL DEFAULT 0,
  is_visible  BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_widgets_facility_module
  ON dashboard_widgets(facility_id, module);

-- ----------------------------------------------------------------
-- activity_feed — facility-scoped event stream
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_feed (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID        NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  user_id     UUID        REFERENCES profiles(id),
  module      app_module,
  event_type  TEXT        NOT NULL,
  description TEXT,
  record_id   UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_facility_time
  ON activity_feed(facility_id, created_at DESC);
