-- Link documents to staff members (parallel to patient_id for residents)
ALTER TABLE documents_legacy
  ADD COLUMN IF NOT EXISTS staff_member_id uuid
    REFERENCES staff_members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS documents_legacy_staff_idx
  ON documents_legacy(staff_member_id)
  WHERE staff_member_id IS NOT NULL;
