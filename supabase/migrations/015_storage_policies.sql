-- Storage bucket policies for the documents bucket.
-- Path structure enforced: documents/{facility_id}/{module}/...
-- Depends on: 012_new_tables.sql, 014_rls_policies.sql

-- Make the documents bucket private
UPDATE storage.buckets
SET public = false
WHERE id = 'documents';

-- Drop any legacy storage policies on the documents bucket
DROP POLICY IF EXISTS "give users access to own folder"     ON storage.objects;
DROP POLICY IF EXISTS "storage_read_by_module_permission"  ON storage.objects;
DROP POLICY IF EXISTS "storage_upload_by_module_permission" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_by_module_permission" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_admins_only"          ON storage.objects;

-- ----------------------------------------------------------------
-- SELECT — download files
-- Path segment [1] = facility_id, [2] = module
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
        ((storage.foldername(name))[2] = 'admin'            AND fm.perm_admin      != 'none') OR
        ((storage.foldername(name))[2] = 'staff'            AND fm.perm_staff      != 'none') OR
        ((storage.foldername(name))[2] = 'hr'               AND fm.perm_hr         != 'none') OR
        ((storage.foldername(name))[2] = 'board_governance' AND fm.perm_board      != 'none') OR
        ((storage.foldername(name))[2] = 'residence'        AND fm.perm_residence  != 'none') OR
        ((storage.foldername(name))[2] = 'finance'          AND fm.perm_finance    != 'none') OR
        ((storage.foldername(name))[2] = 'kitchen'          AND fm.perm_kitchen    != 'none') OR
        ((storage.foldername(name))[2] = 'medical'          AND fm.perm_medical    != 'none')
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
        ((storage.foldername(name))[2] = 'admin'            AND fm.perm_admin      = 'full') OR
        ((storage.foldername(name))[2] = 'staff'            AND fm.perm_staff      IN ('full', 'own')) OR
        ((storage.foldername(name))[2] = 'hr'               AND fm.perm_hr         = 'full') OR
        ((storage.foldername(name))[2] = 'board_governance' AND fm.perm_board      = 'full') OR
        ((storage.foldername(name))[2] = 'residence'        AND fm.perm_residence  IN ('full', 'own')) OR
        ((storage.foldername(name))[2] = 'finance'          AND fm.perm_finance    = 'full') OR
        ((storage.foldername(name))[2] = 'kitchen'          AND fm.perm_kitchen    = 'full') OR
        ((storage.foldername(name))[2] = 'medical'          AND fm.perm_medical    = 'full')
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
        ((storage.foldername(name))[2] = 'admin'            AND fm.perm_admin      = 'full') OR
        ((storage.foldername(name))[2] = 'staff'            AND fm.perm_staff      IN ('full', 'own')) OR
        ((storage.foldername(name))[2] = 'hr'               AND fm.perm_hr         = 'full') OR
        ((storage.foldername(name))[2] = 'board_governance' AND fm.perm_board      = 'full') OR
        ((storage.foldername(name))[2] = 'residence'        AND fm.perm_residence  IN ('full', 'own')) OR
        ((storage.foldername(name))[2] = 'finance'          AND fm.perm_finance    = 'full') OR
        ((storage.foldername(name))[2] = 'kitchen'          AND fm.perm_kitchen    = 'full') OR
        ((storage.foldername(name))[2] = 'medical'          AND fm.perm_medical    = 'full')
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
      AND fm.perm_admin       = 'full'
  )
);
