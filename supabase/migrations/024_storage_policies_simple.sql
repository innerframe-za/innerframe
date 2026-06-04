-- Replace all storage policies with simple facility-membership checks.
-- The previous policies used permission_level enum casts which caused
-- Supabase Storage's schema cache to permanently return 400
-- "The database schema is invalid or incompatible" on every upload/download.
--
-- Pillar-level permission enforcement is handled by the application layer
-- (usePermissions hook). Storage just needs to confirm the user belongs
-- to the facility that owns the file.

DROP POLICY IF EXISTS "storage_read_by_module_permission"   ON storage.objects;
DROP POLICY IF EXISTS "storage_upload_by_module_permission" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_by_module_permission" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_admins_only"          ON storage.objects;
DROP POLICY IF EXISTS "storage_super_admin_all"             ON storage.objects;

-- Helper: returns TRUE if the current user is an active member of the facility
-- identified by the first path segment of the storage object name.
-- Uses only text comparisons — no custom types.

CREATE POLICY "storage_read"
ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    (storage.foldername(name))[1] IN (
      SELECT facility_id::text FROM facility_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    OR get_my_role() = 'super_admin'
  )
);

CREATE POLICY "storage_insert"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (
    (storage.foldername(name))[1] IN (
      SELECT facility_id::text FROM facility_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    OR get_my_role() = 'super_admin'
  )
);

CREATE POLICY "storage_update"
ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    (storage.foldername(name))[1] IN (
      SELECT facility_id::text FROM facility_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    OR get_my_role() = 'super_admin'
  )
);

CREATE POLICY "storage_delete"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    (storage.foldername(name))[1] IN (
      SELECT facility_id::text FROM facility_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    OR get_my_role() = 'super_admin'
  )
);
