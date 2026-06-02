-- Row-Level Security for the multi-tenant permission system.
-- Enables RLS on all new tables and applies per-module policies.
-- Depends on: 012_new_tables.sql, 013_triggers.sql

-- ----------------------------------------------------------------
-- Enable RLS on all new tables
-- ----------------------------------------------------------------
ALTER TABLE facilities           ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log            ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets    ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed        ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- Helper: fetch the current user's active membership for a facility.
-- SECURITY DEFINER so it can bypass RLS on facility_memberships
-- when called from within other RLS policies.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_membership(p_facility_id UUID)
RETURNS facility_memberships
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT *
  FROM facility_memberships
  WHERE facility_id = p_facility_id
    AND user_id     = auth.uid()
    AND status      = 'active'
  LIMIT 1;
$$;

-- ----------------------------------------------------------------
-- facilities policies
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "users_see_own_facilities" ON facilities;
CREATE POLICY "users_see_own_facilities" ON facilities
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM facility_memberships fm
      WHERE fm.facility_id = facilities.id
        AND fm.user_id     = auth.uid()
        AND fm.status      = 'active'
    )
  );

DROP POLICY IF EXISTS "admins_can_update_facility" ON facilities;
CREATE POLICY "admins_can_update_facility" ON facilities
  FOR UPDATE TO authenticated
  USING (
    (get_membership(id)).perm_admin = 'full'
  );

-- ----------------------------------------------------------------
-- profiles policies
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "users_see_own_profile" ON profiles;
CREATE POLICY "users_see_own_profile" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- ----------------------------------------------------------------
-- facility_memberships policies
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "members_see_facility_memberships" ON facility_memberships;
CREATE POLICY "members_see_facility_memberships" ON facility_memberships
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM facility_memberships fm
      WHERE fm.facility_id = facility_memberships.facility_id
        AND fm.user_id     = auth.uid()
        AND fm.status      = 'active'
    )
  );

DROP POLICY IF EXISTS "admins_can_insert_memberships" ON facility_memberships;
CREATE POLICY "admins_can_insert_memberships" ON facility_memberships
  FOR INSERT TO authenticated
  WITH CHECK (
    (get_membership(facility_id)).perm_admin = 'full'
  );

DROP POLICY IF EXISTS "admins_can_update_memberships" ON facility_memberships;
CREATE POLICY "admins_can_update_memberships" ON facility_memberships
  FOR UPDATE TO authenticated
  USING (
    (get_membership(facility_id)).perm_admin = 'full'
  );

-- ----------------------------------------------------------------
-- contacts policies
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "members_read_contacts" ON contacts;
CREATE POLICY "members_read_contacts" ON contacts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM facility_memberships fm
      WHERE fm.facility_id   = contacts.facility_id
        AND fm.user_id       = auth.uid()
        AND fm.status        = 'active'
        AND (fm.perm_residence != 'none' OR fm.perm_medical != 'none')
    )
  );

DROP POLICY IF EXISTS "members_write_contacts" ON contacts;
CREATE POLICY "members_write_contacts" ON contacts
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM facility_memberships fm
      WHERE fm.facility_id   = contacts.facility_id
        AND fm.user_id       = auth.uid()
        AND fm.status        = 'active'
        AND (fm.perm_residence = 'full' OR fm.perm_medical = 'full')
    )
  );

-- ----------------------------------------------------------------
-- documents policies — module-scoped read and write
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "members_read_documents" ON documents;
CREATE POLICY "members_read_documents" ON documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM facility_memberships fm
      WHERE fm.facility_id = documents.facility_id
        AND fm.user_id     = auth.uid()
        AND fm.status      = 'active'
        AND (
          (documents.module = 'admin'            AND fm.perm_admin      != 'none') OR
          (documents.module = 'staff'            AND fm.perm_staff      != 'none') OR
          (documents.module = 'hr'               AND fm.perm_hr         != 'none') OR
          (documents.module = 'board_governance' AND fm.perm_board      != 'none') OR
          (documents.module = 'residence'        AND fm.perm_residence  != 'none') OR
          (documents.module = 'finance'          AND fm.perm_finance    != 'none') OR
          (documents.module = 'kitchen'          AND fm.perm_kitchen    != 'none') OR
          (documents.module = 'medical'          AND fm.perm_medical    != 'none')
        )
    )
  );

DROP POLICY IF EXISTS "members_write_documents" ON documents;
CREATE POLICY "members_write_documents" ON documents
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM facility_memberships fm
      WHERE fm.facility_id = documents.facility_id
        AND fm.user_id     = auth.uid()
        AND fm.status      = 'active'
        AND (
          (documents.module = 'admin'            AND fm.perm_admin      = 'full') OR
          (documents.module = 'staff'            AND fm.perm_staff      IN ('full', 'own')) OR
          (documents.module = 'hr'               AND fm.perm_hr         = 'full') OR
          (documents.module = 'board_governance' AND fm.perm_board      = 'full') OR
          (documents.module = 'residence'        AND fm.perm_residence  IN ('full', 'own')) OR
          (documents.module = 'finance'          AND fm.perm_finance    = 'full') OR
          (documents.module = 'kitchen'          AND fm.perm_kitchen    = 'full') OR
          (documents.module = 'medical'          AND fm.perm_medical    = 'full')
        )
    )
  );

-- ----------------------------------------------------------------
-- audit_log policies — read for admins, insert for all authenticated
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "members_read_audit_log" ON audit_log;
CREATE POLICY "members_read_audit_log" ON audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM facility_memberships fm
      WHERE fm.facility_id = audit_log.facility_id
        AND fm.user_id     = auth.uid()
        AND fm.status      = 'active'
        AND fm.perm_admin != 'none'
    )
  );

-- Append-only: any authenticated user can insert but never update/delete
DROP POLICY IF EXISTS "service_insert_audit_log" ON audit_log;
CREATE POLICY "service_insert_audit_log" ON audit_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ----------------------------------------------------------------
-- dashboard_widgets policies
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "members_read_widgets" ON dashboard_widgets;
CREATE POLICY "members_read_widgets" ON dashboard_widgets
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM facility_memberships fm
      WHERE fm.facility_id = dashboard_widgets.facility_id
        AND fm.user_id     = auth.uid()
        AND fm.status      = 'active'
    )
  );

DROP POLICY IF EXISTS "admins_manage_widgets" ON dashboard_widgets;
CREATE POLICY "admins_manage_widgets" ON dashboard_widgets
  FOR ALL TO authenticated
  USING (
    (get_membership(facility_id)).perm_admin = 'full'
  );

-- ----------------------------------------------------------------
-- activity_feed policies
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "members_read_activity" ON activity_feed;
CREATE POLICY "members_read_activity" ON activity_feed
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM facility_memberships fm
      WHERE fm.facility_id = activity_feed.facility_id
        AND fm.user_id     = auth.uid()
        AND fm.status      = 'active'
    )
  );
