-- Innerframe Super Admin Account — Quintin
--
-- HOW TO USE:
-- ==========
-- 1. Run migration 004_super_admin_role.sql first (adds super_admin role + Innerframe org).
--
-- 2. Create the auth user in Supabase Dashboard:
--      Authentication → Users → "Add user" (not "Invite user")
--      Email:    quintin@cortexanalytics.co.za
--      Password: (choose a strong password — do not commit it)
--      Auto Confirm User: YES (tick the checkbox so no email is sent)
--
-- 3. After creating the user, copy the UUID shown in the Users table.
--
-- 4. Replace <AUTH_USER_UUID> below with that UUID, then run this SQL
--    in the Supabase SQL editor.

INSERT INTO public.users (id, org_id, full_name, email, role)
VALUES (
  '<AUTH_USER_UUID>',                          -- paste the UUID from step 3
  '00000000-0000-0000-0000-000000000001',      -- Innerframe internal org
  'Quintin-Admin',
  'quintin@cortexanalytics.co.za',
  'super_admin'
)
ON CONFLICT (id) DO UPDATE
  SET role      = 'super_admin',
      full_name = 'Quintin-Admin',
      org_id    = '00000000-0000-0000-0000-000000000001';

-- Verify: should return one row with role = 'super_admin'
SELECT id, full_name, email, role, org_id FROM public.users
WHERE email = 'quintin@cortexanalytics.co.za';
