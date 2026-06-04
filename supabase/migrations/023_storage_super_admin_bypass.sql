-- Allow super_admin users to upload, download, and delete any document in
-- the documents bucket. Without this, super_admins have no facility_memberships
-- row for the target facility and are blocked by the module-permission policies.

CREATE POLICY "storage_super_admin_all"
ON storage.objects
FOR ALL TO authenticated
USING (
  bucket_id = 'documents'
  AND get_my_role() = 'super_admin'
)
WITH CHECK (
  bucket_id = 'documents'
  AND get_my_role() = 'super_admin'
);
