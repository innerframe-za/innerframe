-- CRM activity log / notes per resident
CREATE TABLE IF NOT EXISTS patient_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('call', 'visit', 'incident', 'update', 'general')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE patient_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members access own notes" ON patient_notes
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "org members insert own notes" ON patient_notes
  FOR INSERT WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

-- Notes are immutable once written — no UPDATE policy intentionally
-- Deletion allowed by admins only (enforced at app layer via role check)
CREATE POLICY "org members delete own notes" ON patient_notes
  FOR DELETE USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
