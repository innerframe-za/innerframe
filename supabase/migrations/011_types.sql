-- Custom ENUM types for the multi-tenant permission and module system.
-- Wrapped in DO blocks so re-runs are safe.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_level') THEN
    CREATE TYPE permission_level AS ENUM ('none', 'view', 'own', 'full');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_module') THEN
    CREATE TYPE app_module AS ENUM (
      'admin',
      'staff',
      'hr',
      'board_governance',
      'residence',
      'finance',
      'kitchen',
      'medical'
    );
  END IF;
END
$$;
