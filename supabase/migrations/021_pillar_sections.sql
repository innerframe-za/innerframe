-- Insert global document sections for all 7 pillars.
-- These sections correspond to the keySystems categories from the InnerFrame headers guide.
-- is_global = true, org_id = NULL so every facility sees them.

INSERT INTO document_sections (pillar, title, sort_order, is_global, org_id) VALUES

  -- Admin Office
  ('admin', 'Administration File Structure', 10, true, NULL),
  ('admin', 'Daily Controls',               20, true, NULL),
  ('admin', 'Compliance Requirements',      30, true, NULL),

  -- Finance
  ('finance', 'Financial Controls',   10, true, NULL),
  ('finance', 'Reporting',            20, true, NULL),
  ('finance', 'Payroll & HR Finance', 30, true, NULL),
  ('finance', 'Procurement Controls', 40, true, NULL),

  -- Kitchen
  ('kitchen', 'Kitchen Controls',   10, true, NULL),
  ('kitchen', 'Food Management',    20, true, NULL),
  ('kitchen', 'Stock Systems',      30, true, NULL),
  ('kitchen', 'Hygiene Standards',  40, true, NULL),

  -- Medical
  ('medical', 'Medical Documentation', 10, true, NULL),
  ('medical', 'Safety Systems',        20, true, NULL),
  ('medical', 'Infection Control',     30, true, NULL),
  ('medical', 'Shift Controls',        40, true, NULL),

  -- Board Governance
  ('board_governance', 'Governance Structure',   10, true, NULL),
  ('board_governance', 'Board Documentation',    20, true, NULL),
  ('board_governance', 'Oversight Systems',      30, true, NULL),
  ('board_governance', 'Sustainability Planning',40, true, NULL),

  -- Medical Residence
  ('medical_residence', 'Residential Care Documentation', 10, true, NULL),
  ('medical_residence', 'Monitoring & Review',            20, true, NULL),
  ('medical_residence', 'Communication Systems',          30, true, NULL),

  -- HR
  ('hr', 'Staff Records',         10, true, NULL),
  ('hr', 'Leave & Attendance',    20, true, NULL),
  ('hr', 'Training & Development',30, true, NULL),
  ('hr', 'Compliance & Discipline',40, true, NULL);
