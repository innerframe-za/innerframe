-- Migrate existing legacy data into the new multi-tenant permission system.
-- Safe to re-run: every INSERT uses ON CONFLICT DO NOTHING.
--
-- What moves:
--   organisations  → facilities        (same UUID)
--   users          → facility_memberships (role-mapped, perms preserved)
--   patients       → contacts          (contact_type='resident', medical fields in metadata)
--   documents_legacy (non-global, with uploaded_by) → documents
--
-- What stays in the legacy tables (for the existing portal UI):
--   organisations, users, patients, documents_legacy — untouched.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. organisations → facilities
--    Slug = cleaned name + first 6 hex chars of UUID (guarantees uniqueness
--    even when org names are identical).
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO facilities (id, name, slug, facility_type, subscription_tier, is_active, created_at, updated_at)
SELECT
  o.id,
  o.name,
  COALESCE(
    NULLIF(
      lower(regexp_replace(
        regexp_replace(trim(o.name), '[^a-zA-Z0-9\s]', '', 'g'),
        '\s+', '-', 'g'
      )),
      ''
    ),
    'facility'
  ) || '-' || substr(replace(o.id::text, '-', ''), 1, 6) AS slug,
  'care_home'  AS facility_type,
  'standard'   AS subscription_tier,
  true         AS is_active,
  COALESCE(o.created_at, now()),
  now()
FROM organisations o
WHERE o.id != '00000000-0000-0000-0000-000000000001'
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. users → facility_memberships
--    home_admin → facility_admin  (trigger gives perm_* = 'full' on all modules)
--    staff      → general_staff   (perms fixed up in step 3)
--    super_admin → skipped        (not facility-scoped)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO facility_memberships (facility_id, user_id, role, status, created_at, updated_at)
SELECT
  u.org_id AS facility_id,
  u.id     AS user_id,
  CASE u.role
    WHEN 'home_admin' THEN 'facility_admin'
    ELSE 'general_staff'
  END,
  'active',
  COALESCE(u.created_at, now()),
  now()
FROM users u
JOIN facilities f ON f.id = u.org_id   -- only orgs that were just migrated
WHERE u.role IN ('home_admin', 'staff')
ON CONFLICT (facility_id, user_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3a. Staff with NO staff_permissions rows had full access in the old system.
--     Preserve that by setting all modules to 'full'.
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE facility_memberships fm
SET
  perm_admin     = 'full',
  perm_staff     = 'full',
  perm_hr        = 'full',
  perm_board     = 'full',
  perm_residence = 'full',
  perm_finance   = 'full',
  perm_kitchen   = 'full',
  perm_medical   = 'full'
WHERE fm.role = 'general_staff'
  AND EXISTS     (SELECT 1 FROM facilities f   WHERE f.id      = fm.facility_id)
  AND NOT EXISTS (SELECT 1 FROM staff_permissions sp WHERE sp.user_id = fm.user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3b. Staff WITH explicit staff_permissions rows: map can_view/can_edit
--     to the new permission_level enum.
--     Pillars with no row default to 'full' (old system behaviour).
--     medical_residence → perm_residence; staff module has no old equivalent → 'full'.
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE facility_memberships fm
SET
  perm_admin = COALESCE(
    (SELECT CASE WHEN sp.can_edit THEN 'full'::permission_level
                 WHEN sp.can_view THEN 'view'::permission_level
                 ELSE 'none'::permission_level END
     FROM staff_permissions sp WHERE sp.user_id = fm.user_id AND sp.pillar_slug = 'admin'),
    'full'::permission_level),

  perm_staff = 'full'::permission_level,  -- no old equivalent, preserve open access

  perm_hr = COALESCE(
    (SELECT CASE WHEN sp.can_edit THEN 'full'::permission_level
                 WHEN sp.can_view THEN 'view'::permission_level
                 ELSE 'none'::permission_level END
     FROM staff_permissions sp WHERE sp.user_id = fm.user_id AND sp.pillar_slug = 'hr'),
    'full'::permission_level),

  perm_board = COALESCE(
    (SELECT CASE WHEN sp.can_edit THEN 'full'::permission_level
                 WHEN sp.can_view THEN 'view'::permission_level
                 ELSE 'none'::permission_level END
     FROM staff_permissions sp WHERE sp.user_id = fm.user_id AND sp.pillar_slug = 'board_governance'),
    'full'::permission_level),

  perm_residence = COALESCE(
    (SELECT CASE WHEN sp.can_edit THEN 'full'::permission_level
                 WHEN sp.can_view THEN 'view'::permission_level
                 ELSE 'none'::permission_level END
     FROM staff_permissions sp WHERE sp.user_id = fm.user_id AND sp.pillar_slug = 'medical_residence'),
    'full'::permission_level),

  perm_finance = COALESCE(
    (SELECT CASE WHEN sp.can_edit THEN 'full'::permission_level
                 WHEN sp.can_view THEN 'view'::permission_level
                 ELSE 'none'::permission_level END
     FROM staff_permissions sp WHERE sp.user_id = fm.user_id AND sp.pillar_slug = 'finance'),
    'full'::permission_level),

  perm_kitchen = COALESCE(
    (SELECT CASE WHEN sp.can_edit THEN 'full'::permission_level
                 WHEN sp.can_view THEN 'view'::permission_level
                 ELSE 'none'::permission_level END
     FROM staff_permissions sp WHERE sp.user_id = fm.user_id AND sp.pillar_slug = 'kitchen'),
    'full'::permission_level),

  perm_medical = COALESCE(
    (SELECT CASE WHEN sp.can_edit THEN 'full'::permission_level
                 WHEN sp.can_view THEN 'view'::permission_level
                 ELSE 'none'::permission_level END
     FROM staff_permissions sp WHERE sp.user_id = fm.user_id AND sp.pillar_slug = 'medical'),
    'full'::permission_level)

WHERE fm.role = 'general_staff'
  AND EXISTS (SELECT 1 FROM facilities f      WHERE f.id      = fm.facility_id)
  AND EXISTS (SELECT 1 FROM staff_permissions sp WHERE sp.user_id = fm.user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. patients → contacts
--    Same UUID so cross-referencing is preserved.
--    Medical fields stored in metadata JSONB (nulls stripped).
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO contacts (
  id, facility_id, contact_type, full_name,
  metadata, is_active, created_at, updated_at
)
SELECT
  p.id,
  p.org_id,
  'resident',
  p.full_name,
  jsonb_strip_nulls(jsonb_build_object(
    'date_of_birth',             p.date_of_birth,
    'id_number',                 p.id_number,
    'room_number',               p.room_number,
    'admission_date',            p.admission_date,
    'discharge_date',            p.discharge_date,
    'status',                    p.status,
    'allergies',                 p.allergies,
    'chronic_conditions',        p.chronic_conditions,
    'current_medications',       p.current_medications,
    'gp_name',                   p.gp_name,
    'gp_contact',                p.gp_contact,
    'medical_aid_scheme',        p.medical_aid_scheme,
    'medical_aid_member_number', p.medical_aid_member_number,
    'religion',                  p.religion,
    'language',                  p.language,
    'dietary_requirements',      p.dietary_requirements
  )),
  CASE p.status WHEN 'active' THEN true ELSE false END,
  COALESCE(p.created_at, now()),
  now()
FROM patients p
JOIN facilities f ON f.id = p.org_id
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. documents_legacy → documents
--    Skips: global docs, docs with no uploaded_by, unknown pillar values.
--    medical_residence → residence (nearest app_module equivalent).
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO documents (
  id, facility_id, module, title, tags, storage_path, uploaded_by, created_at
)
SELECT
  d.id,
  d.org_id,
  CASE d.pillar
    WHEN 'medical_residence' THEN 'residence'::app_module
    ELSE d.pillar::app_module
  END,
  COALESCE(NULLIF(trim(d.title), ''), d.file_name),
  '{}',
  d.file_url,      -- file_url was always a storage path, not a public URL
  d.uploaded_by,
  COALESCE(d.created_at, now())
FROM documents_legacy d
JOIN facilities f ON f.id = d.org_id
WHERE d.is_global    = false
  AND d.uploaded_by IS NOT NULL
  AND d.pillar IN ('admin', 'finance', 'kitchen', 'medical', 'board_governance', 'medical_residence', 'hr')
ON CONFLICT (id) DO NOTHING;
