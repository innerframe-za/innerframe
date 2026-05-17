-- Innerframe Care Solutions — Row Level Security Policies
-- Apply after 001_initial_schema.sql

-- ----------------------------------------------------------------
-- Enable RLS on all tables
-- ----------------------------------------------------------------
ALTER TABLE organisations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs        ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- Helper: returns the logged-in user's org_id
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_my_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ----------------------------------------------------------------
-- Helper: returns the logged-in user's role
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ----------------------------------------------------------------
-- organisations: read own org only
-- ----------------------------------------------------------------
CREATE POLICY "read_own_org"
  ON organisations FOR SELECT
  USING (id = get_my_org_id());

-- ----------------------------------------------------------------
-- users: read own org's users; insert/update by home_admin only
-- ----------------------------------------------------------------
CREATE POLICY "read_org_users"
  ON users FOR SELECT
  USING (org_id = get_my_org_id());

CREATE POLICY "insert_org_users"
  ON users FOR INSERT
  WITH CHECK (org_id = get_my_org_id() AND get_my_role() = 'home_admin');

CREATE POLICY "update_org_users"
  ON users FOR UPDATE
  USING (org_id = get_my_org_id() AND get_my_role() = 'home_admin');

-- ----------------------------------------------------------------
-- patients: all operations scoped to own org
-- ----------------------------------------------------------------
CREATE POLICY "org_patients"
  ON patients FOR ALL
  USING (org_id = get_my_org_id());

-- ----------------------------------------------------------------
-- document_categories: scoped to own org
-- ----------------------------------------------------------------
CREATE POLICY "org_categories"
  ON document_categories FOR ALL
  USING (org_id = get_my_org_id());

-- ----------------------------------------------------------------
-- document_sections:
--   SELECT: global sections visible to everyone + own org sections
--   INSERT/UPDATE/DELETE: home_admin only, own org sections
-- ----------------------------------------------------------------
CREATE POLICY "read_sections"
  ON document_sections FOR SELECT
  USING (is_global = true OR org_id = get_my_org_id());

CREATE POLICY "manage_org_sections"
  ON document_sections FOR ALL
  USING (org_id = get_my_org_id() AND get_my_role() = 'home_admin');

-- ----------------------------------------------------------------
-- documents:
--   SELECT: global docs + own org docs
--   INSERT: own org only
--   DELETE: home_admin only, non-global docs in own org
-- ----------------------------------------------------------------
CREATE POLICY "read_global_docs"
  ON documents FOR SELECT
  USING (is_global = true);

CREATE POLICY "read_org_docs"
  ON documents FOR SELECT
  USING (org_id = get_my_org_id());

CREATE POLICY "insert_docs"
  ON documents FOR INSERT
  WITH CHECK (org_id = get_my_org_id());

CREATE POLICY "delete_org_docs"
  ON documents FOR DELETE
  USING (
    org_id = get_my_org_id()
    AND is_global = false
    AND get_my_role() = 'home_admin'
  );

-- ----------------------------------------------------------------
-- audit_logs: read own org; insert own org
-- ----------------------------------------------------------------
CREATE POLICY "read_org_logs"
  ON audit_logs FOR SELECT
  USING (org_id = get_my_org_id());

CREATE POLICY "insert_org_logs"
  ON audit_logs FOR INSERT
  WITH CHECK (org_id = get_my_org_id());
