-- Extended resident (patient) profile fields for CRM functionality
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS allergies                  TEXT,
  ADD COLUMN IF NOT EXISTS chronic_conditions         TEXT,
  ADD COLUMN IF NOT EXISTS current_medications        TEXT,
  ADD COLUMN IF NOT EXISTS gp_name                    TEXT,
  ADD COLUMN IF NOT EXISTS gp_contact                 TEXT,
  ADD COLUMN IF NOT EXISTS medical_aid_scheme         TEXT,
  ADD COLUMN IF NOT EXISTS medical_aid_member_number  TEXT,
  ADD COLUMN IF NOT EXISTS religion                   TEXT,
  ADD COLUMN IF NOT EXISTS language                   TEXT,
  ADD COLUMN IF NOT EXISTS dietary_requirements       TEXT,
  ADD COLUMN IF NOT EXISTS discharge_date             DATE;
