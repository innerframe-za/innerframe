-- Trigger functions for the multi-tenant permission system.
-- All functions use CREATE OR REPLACE for safe re-runs.
-- Depends on: 012_new_tables.sql

-- ----------------------------------------------------------------
-- 1. Auto-set updated_at on every UPDATE
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'facilities', 'profiles', 'facility_memberships', 'contacts', 'documents'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I;
       CREATE TRIGGER set_updated_at
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      t, t
    );
  END LOOP;
END;
$$;

-- ----------------------------------------------------------------
-- 2. Apply role defaults when a membership row is created
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION apply_role_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  CASE NEW.role

    WHEN 'super_admin' THEN
      NEW.perm_admin     := 'full';
      NEW.perm_staff     := 'full';
      NEW.perm_hr        := 'full';
      NEW.perm_board     := 'full';
      NEW.perm_residence := 'full';
      NEW.perm_finance   := 'full';
      NEW.perm_kitchen   := 'full';
      NEW.perm_medical   := 'full';

    WHEN 'facility_admin' THEN
      NEW.perm_admin     := 'full';
      NEW.perm_staff     := 'full';
      NEW.perm_hr        := 'full';
      NEW.perm_board     := 'full';
      NEW.perm_residence := 'full';
      NEW.perm_finance   := 'full';
      NEW.perm_kitchen   := 'full';
      NEW.perm_medical   := 'full';

    WHEN 'hr_manager' THEN
      NEW.perm_staff     := 'full';
      NEW.perm_hr        := 'full';
      NEW.perm_board     := 'none';

    WHEN 'finance_officer' THEN
      NEW.perm_finance   := 'full';
      NEW.perm_board     := 'view';

    WHEN 'medical_staff' THEN
      NEW.perm_medical   := 'full';
      NEW.perm_residence := 'full';
      NEW.perm_staff     := 'own';

    WHEN 'board_member' THEN
      NEW.perm_board     := 'full';
      NEW.perm_hr        := 'view';
      NEW.perm_finance   := 'view';

    WHEN 'kitchen_staff' THEN
      NEW.perm_kitchen   := 'full';
      NEW.perm_residence := 'view';

    WHEN 'general_staff' THEN
      NEW.perm_staff     := 'own';
      NEW.perm_residence := 'view';

    ELSE
      NULL; -- all perms remain 'none'
  END CASE;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_role_defaults ON facility_memberships;
CREATE TRIGGER set_role_defaults
  BEFORE INSERT ON facility_memberships
  FOR EACH ROW EXECUTE FUNCTION apply_role_defaults();

-- ----------------------------------------------------------------
-- 3. Log permission changes to audit_log automatically
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_permission_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (
    OLD.perm_admin     IS DISTINCT FROM NEW.perm_admin     OR
    OLD.perm_staff     IS DISTINCT FROM NEW.perm_staff     OR
    OLD.perm_hr        IS DISTINCT FROM NEW.perm_hr        OR
    OLD.perm_board     IS DISTINCT FROM NEW.perm_board     OR
    OLD.perm_residence IS DISTINCT FROM NEW.perm_residence OR
    OLD.perm_finance   IS DISTINCT FROM NEW.perm_finance   OR
    OLD.perm_kitchen   IS DISTINCT FROM NEW.perm_kitchen   OR
    OLD.perm_medical   IS DISTINCT FROM NEW.perm_medical   OR
    OLD.role           IS DISTINCT FROM NEW.role           OR
    OLD.status         IS DISTINCT FROM NEW.status
  ) THEN
    INSERT INTO audit_log (
      facility_id, user_id, action, table_name, record_id,
      old_values, new_values
    ) VALUES (
      NEW.facility_id,
      auth.uid(),
      'PERMISSION_CHANGE',
      'facility_memberships',
      NEW.id,
      jsonb_build_object(
        'role', OLD.role, 'status', OLD.status,
        'perm_admin', OLD.perm_admin, 'perm_staff', OLD.perm_staff,
        'perm_hr', OLD.perm_hr, 'perm_board', OLD.perm_board,
        'perm_residence', OLD.perm_residence, 'perm_finance', OLD.perm_finance,
        'perm_kitchen', OLD.perm_kitchen, 'perm_medical', OLD.perm_medical
      ),
      jsonb_build_object(
        'role', NEW.role, 'status', NEW.status,
        'perm_admin', NEW.perm_admin, 'perm_staff', NEW.perm_staff,
        'perm_hr', NEW.perm_hr, 'perm_board', NEW.perm_board,
        'perm_residence', NEW.perm_residence, 'perm_finance', NEW.perm_finance,
        'perm_kitchen', NEW.perm_kitchen, 'perm_medical', NEW.perm_medical
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_permission_changes ON facility_memberships;
CREATE TRIGGER audit_permission_changes
  AFTER UPDATE ON facility_memberships
  FOR EACH ROW EXECUTE FUNCTION log_permission_changes();

-- ----------------------------------------------------------------
-- 4. General audit trigger for contacts and documents
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_row_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_facility_id UUID;
  v_record_id   UUID;
BEGIN
  v_facility_id := COALESCE(NEW.facility_id, OLD.facility_id);
  v_record_id   := COALESCE(NEW.id, OLD.id);

  INSERT INTO audit_log (
    facility_id, user_id, action, table_name, record_id,
    old_values, new_values
  ) VALUES (
    v_facility_id,
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    v_record_id,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE row_to_json(OLD)::jsonb END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW)::jsonb END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_contacts ON contacts;
CREATE TRIGGER audit_contacts
  AFTER INSERT OR UPDATE OR DELETE ON contacts
  FOR EACH ROW EXECUTE FUNCTION audit_row_changes();

DROP TRIGGER IF EXISTS audit_documents ON documents;
CREATE TRIGGER audit_documents
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION audit_row_changes();
