-- Add username support to users and profiles tables.

-- 1. Add username columns (nullable; unique per lowercase value)
ALTER TABLE users    ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique
  ON users(lower(username)) WHERE username IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique
  ON profiles(lower(username)) WHERE username IS NOT NULL;

-- 2. RPC for resolving username → email before login (callable by anon key)
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
BEGIN
  -- Check legacy users table first
  SELECT email INTO v_email
    FROM users
   WHERE lower(username) = lower(p_username)
   LIMIT 1;

  IF v_email IS NOT NULL THEN
    RETURN v_email;
  END IF;

  -- Check new-system profiles table
  SELECT email INTO v_email
    FROM profiles
   WHERE lower(username) = lower(p_username)
   LIMIT 1;

  RETURN v_email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO anon, authenticated;

-- 3. Update handle_new_auth_user trigger to persist username from metadata
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
  v_username  TEXT;
BEGIN
  BEGIN
    v_org_id := (NEW.raw_user_meta_data->>'org_id')::UUID;
  EXCEPTION WHEN others THEN
    v_org_id := NULL;
  END;

  IF v_org_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_full_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), split_part(NEW.email, '@', 1));
  v_role      := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'role'), ''), 'staff');
  v_username  := NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), '');

  INSERT INTO public.users (id, org_id, full_name, email, role, username)
  VALUES (NEW.id, v_org_id, v_full_name, NEW.email, v_role, v_username)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 4. Update create_profile_on_signup to persist username from metadata
CREATE OR REPLACE FUNCTION public.create_profile_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
