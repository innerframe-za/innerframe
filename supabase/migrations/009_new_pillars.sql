-- Add Medical Residence and HR as new pillar slugs across all constrained columns

ALTER TABLE document_sections
  DROP CONSTRAINT IF EXISTS document_sections_pillar_check;
ALTER TABLE document_sections
  ADD CONSTRAINT document_sections_pillar_check
    CHECK (pillar IN ('admin', 'finance', 'kitchen', 'medical', 'board_governance', 'medical_residence', 'hr'));

ALTER TABLE documents
  DROP CONSTRAINT IF EXISTS documents_pillar_check;
ALTER TABLE documents
  ADD CONSTRAINT documents_pillar_check
    CHECK (pillar IN ('admin', 'finance', 'kitchen', 'medical', 'board_governance', 'medical_residence', 'hr'));

ALTER TABLE staff_permissions
  DROP CONSTRAINT IF EXISTS staff_permissions_pillar_slug_check;
ALTER TABLE staff_permissions
  ADD CONSTRAINT staff_permissions_pillar_slug_check
    CHECK (pillar_slug IN ('admin', 'finance', 'kitchen', 'medical', 'board_governance', 'medical_residence', 'hr'));
