-- Emergency / next-of-kin contacts for each resident
CREATE TABLE IF NOT EXISTS patient_contacts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id   UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  org_id       UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  relationship TEXT,
  email        TEXT,
  phone        TEXT,
  is_primary   BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE patient_contacts ENABLE ROW LEVEL SECURITY;

-- Staff can only see contacts belonging to their own facility
CREATE POLICY "org members access own contacts" ON patient_contacts
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "org members insert own contacts" ON patient_contacts
  FOR INSERT WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "org members update own contacts" ON patient_contacts
  FOR UPDATE USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "org members delete own contacts" ON patient_contacts
  FOR DELETE USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
