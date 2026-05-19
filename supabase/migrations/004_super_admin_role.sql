-- Innerframe Care Solutions — Super Admin Role
-- Apply after 003_auth_user_trigger.sql

-- ----------------------------------------------------------------
-- 1. Expand the role constraint to include super_admin
-- ----------------------------------------------------------------
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('home_admin', 'staff', 'super_admin'));

-- ----------------------------------------------------------------
-- 2. Innerframe internal organisation (fixed UUID)
--    Super admin users belong to this org.
--    Global documents are stored under this org_id.
-- ----------------------------------------------------------------
INSERT INTO organisations (id, name, contact_email)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Innerframe Care Solutions',
  'admin@innerframe.co.za'
) ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- 3. Super admin bypass RLS — permissive policies are OR-ed with
--    existing restrictive ones, so super_admin sees everything.
-- ----------------------------------------------------------------
CREATE POLICY "super_admin_orgs"
  ON organisations FOR ALL
  USING (get_my_role() = 'super_admin');

CREATE POLICY "super_admin_users"
  ON users FOR ALL
  USING (get_my_role() = 'super_admin');

CREATE POLICY "super_admin_patients"
  ON patients FOR ALL
  USING (get_my_role() = 'super_admin');

CREATE POLICY "super_admin_categories"
  ON document_categories FOR ALL
  USING (get_my_role() = 'super_admin');

CREATE POLICY "super_admin_sections"
  ON document_sections FOR ALL
  USING (get_my_role() = 'super_admin');

CREATE POLICY "super_admin_docs"
  ON documents FOR ALL
  USING (get_my_role() = 'super_admin');

CREATE POLICY "super_admin_audit"
  ON audit_logs FOR ALL
  USING (get_my_role() = 'super_admin');

-- ----------------------------------------------------------------
-- 4. Restrict is_global=true inserts to super_admin only.
--    Drop the old open policy and replace with a guarded one.
-- ----------------------------------------------------------------
DROP POLICY "insert_docs" ON documents;

CREATE POLICY "insert_org_docs"
  ON documents FOR INSERT
  WITH CHECK (
    CASE
      WHEN is_global = true THEN get_my_role() = 'super_admin'
      ELSE org_id = get_my_org_id()
    END
  );

-- Prevent any user from flipping is_global via UPDATE unless super_admin
CREATE POLICY "update_docs"
  ON documents FOR UPDATE
  USING (
    org_id = get_my_org_id()
    AND is_global = false
    AND get_my_role() = 'home_admin'
  )
  WITH CHECK (
    CASE
      WHEN is_global = true THEN get_my_role() = 'super_admin'
      ELSE org_id = get_my_org_id()
    END
  );
