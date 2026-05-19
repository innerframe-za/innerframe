-- Per-pillar visibility permissions for staff members.
-- home_admin of the same org manages these rows; staff can read their own.
-- super_admin access is covered by the permissive bypass in 004_super_admin_role.sql.

CREATE TABLE IF NOT EXISTS staff_permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pillar_slug TEXT NOT NULL CHECK (pillar_slug IN ('admin', 'finance', 'kitchen', 'medical', 'board_governance')),
  can_view    BOOLEAN NOT NULL DEFAULT true,
  can_edit    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, pillar_slug)
);

ALTER TABLE staff_permissions ENABLE ROW LEVEL SECURITY;

-- home_admin can read, insert, update, delete permissions for staff in their org
CREATE POLICY "home_admin manage staff permissions"
  ON staff_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users requester
      WHERE requester.id = auth.uid()
        AND requester.role = 'home_admin'
        AND requester.org_id = (
          SELECT target.org_id FROM users target WHERE target.id = staff_permissions.user_id
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users requester
      WHERE requester.id = auth.uid()
        AND requester.role = 'home_admin'
        AND requester.org_id = (
          SELECT target.org_id FROM users target WHERE target.id = staff_permissions.user_id
        )
    )
  );

-- Staff can read their own permission rows
CREATE POLICY "staff read own permissions"
  ON staff_permissions FOR SELECT
  USING (user_id = auth.uid());
