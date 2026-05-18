-- Trigger: auto-create public.users row when a new auth user is created.
--
-- Admins must supply org_id, full_name, and role in raw_user_meta_data
-- when inviting users (via Supabase dashboard or Admin API).
-- Self-signups that lack org_id in metadata are intentionally ignored
-- because every portal user must belong to an organisation.
--
-- Example metadata to pass on invite:
--   { "org_id": "<uuid>", "full_name": "Jane Smith", "role": "home_admin" }

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id    UUID;
  v_full_name TEXT;
  v_role      TEXT;
BEGIN
  -- Only proceed if org_id is supplied; self-signups without it are skipped
  BEGIN
    v_org_id := (NEW.raw_user_meta_data->>'org_id')::UUID;
  EXCEPTION WHEN others THEN
    v_org_id := NULL;
  END;

  IF v_org_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    split_part(NEW.email, '@', 1)
  );
  v_role := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'role'), ''),
    'staff'
  );

  INSERT INTO public.users (id, org_id, full_name, email, role)
  VALUES (NEW.id, v_org_id, v_full_name, NEW.email, v_role)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop before recreating so re-running the migration is safe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();
