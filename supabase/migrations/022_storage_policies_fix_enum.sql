-- Fix storage RLS policies: replace custom permission_level enum casts with
-- plain text comparisons. Supabase Storage's schema cache can't resolve custom
-- types from the public schema, causing "The database schema is invalid or
-- incompatible" errors on every upload and download.

DROP POLICY IF EXISTS "storage_read_by_module_permission"   ON storage.objects;
DROP POLICY IF EXISTS "storage_upload_by_module_permission" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_by_module_permission" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_admins_only"          ON storage.objects;

-- ----------------------------------------------------------------
-- SELECT — download files
-- ----------------------------------------------------------------
CREATE POLICY "storage_read_by_module_permission"
ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1
    FROM facility_memberships fm
    WHERE fm.user_id          = auth.uid()
      AND fm.facility_id::text = (storage.foldername(name))[1]
      AND fm.status           = 'active'
      AND (
        ((storage.foldername(name))[2] = 'admin'            AND fm.perm_admin::text      <> 'none') OR
        ((storage.foldername(name))[2] = 'staff'            AND fm.perm_staff::text      <> 'none') OR
        ((storage.foldername(name))[2] = 'hr'               AND fm.perm_hr::text         <> 'none') OR
        ((storage.foldername(name))[2] = 'board_governance' AND fm.perm_board::text      <> 'none') OR
        ((storage.foldername(name))[2] = 'residence'        AND fm.perm_residence::text  <> 'none') OR
        ((storage.foldername(name))[2] = 'finance'          AND fm.perm_finance::text    <> 'none') OR
        ((storage.foldername(name))[2] = 'kitchen'          AND fm.perm_kitchen::text    <> 'none') OR
        ((storage.foldername(name))[2] = 'medical'          AND fm.perm_medical::text    <> 'none')
      )
  )
);

-- ----------------------------------------------------------------
-- INSERT — upload files
-- ----------------------------------------------------------------
CREATE POLICY "storage_upload_by_module_permission"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1
    FROM facility_memberships fm
    WHERE fm.user_id          = auth.uid()
      AND fm.facility_id::text = (storage.foldername(name))[1]
      AND fm.status           = 'active'
      AND (
        ((storage.foldername(name))[2] = 'admin'            AND fm.perm_admin::text      = 'full') OR
        ((storage.foldername(name))[2] = 'staff'            AND fm.perm_staff::text      IN ('full', 'own')) OR
        ((storage.foldername(name))[2] = 'hr'               AND fm.perm_hr::text         = 'full') OR
        ((storage.foldername(name))[2] = 'board_governance' AND fm.perm_board::text      = 'full') OR
        ((storage.foldername(name))[2] = 'residence'        AND fm.perm_residence::text  IN ('full', 'own')) OR
        ((storage.foldername(name))[2] = 'finance'          AND fm.perm_finance::text    = 'full') OR
        ((storage.foldername(name))[2] = 'kitchen'          AND fm.perm_kitchen::text    = 'full') OR
        ((storage.foldername(name))[2] = 'medical'          AND fm.perm_medical::text    = 'full')
      )
  )
);

-- ----------------------------------------------------------------
-- UPDATE — modify file metadata / overwrite
-- ----------------------------------------------------------------
CREATE POLICY "storage_update_by_module_permission"
ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1
    FROM facility_memberships fm
    WHERE fm.user_id          = auth.uid()
      AND fm.facility_id::text = (storage.foldername(name))[1]
      AND fm.status           = 'active'
      AND (
        ((storage.foldername(name))[2] = 'admin'            AND fm.perm_admin::text      = 'full') OR
        ((storage.foldername(name))[2] = 'staff'            AND fm.perm_staff::text      IN ('full', 'own')) OR
        ((storage.foldername(name))[2] = 'hr'               AND fm.perm_hr::text         = 'full') OR
        ((storage.foldername(name))[2] = 'board_governance' AND fm.perm_board::text      = 'full') OR
        ((storage.foldername(name))[2] = 'residence'        AND fm.perm_residence::text  IN ('full', 'own')) OR
        ((storage.foldername(name))[2] = 'finance'          AND fm.perm_finance::text    = 'full') OR
        ((storage.foldername(name))[2] = 'kitchen'          AND fm.perm_kitchen::text    = 'full') OR
        ((storage.foldername(name))[2] = 'medical'          AND fm.perm_medical::text    = 'full')
      )
  )
);

-- ----------------------------------------------------------------
-- DELETE — admins only
-- ----------------------------------------------------------------
CREATE POLICY "storage_delete_admins_only"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1
    FROM facility_memberships fm
    WHERE fm.user_id          = auth.uid()
      AND fm.facility_id::text = (storage.foldername(name))[1]
      AND fm.status           = 'active'
      AND fm.perm_admin::text  = 'full'
  )
);
