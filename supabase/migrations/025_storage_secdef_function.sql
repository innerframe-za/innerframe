-- Wrap the facility-membership check in a SECURITY DEFINER function.
-- Supabase Storage introspects every referenced table when it parses RLS
-- policy ASTs. Because facility_memberships has permission_level enum
-- columns, that introspection throws "The database schema is invalid or
-- incompatible" even though the enum columns are never used.
-- A SECURITY DEFINER function returns only a boolean to the storage
-- parser, hiding the table internals entirely.

CREATE OR REPLACE FUNCTION storage_is_facility_member(org_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM facility_memberships
    WHERE user_id       = auth.uid()
      AND facility_id::text = org_id
      AND status        = 'active'
  );
$$;

REVOKE EXECUTE ON FUNCTION storage_is_facility_member(text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION storage_is_facility_member(text) TO authenticated;

-- Replace direct-subquery policies with function-based equivalents
DROP POLICY IF EXISTS "storage_read"   ON storage.objects;
DROP POLICY IF EXISTS "storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "storage_update" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete" ON storage.objects;

CREATE POLICY "storage_read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    storage_is_facility_member((storage.foldername(name))[1])
    OR get_my_role() = 'super_admin'
  )
);

CREATE POLICY "storage_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (
    storage_is_facility_member((storage.foldername(name))[1])
    OR get_my_role() = 'super_admin'
  )
);

CREATE POLICY "storage_update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    storage_is_facility_member((storage.foldername(name))[1])
    OR get_my_role() = 'super_admin'
  )
);

CREATE POLICY "storage_delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    storage_is_facility_member((storage.foldername(name))[1])
    OR get_my_role() = 'super_admin'
  )
);
