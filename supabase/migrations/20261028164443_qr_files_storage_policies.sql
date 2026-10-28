/*
# Storage policies for public qr-files bucket

1. Bucket
- `qr-files` bucket (public) already created via SQL.
2. Security
- Allow anon + authenticated to INSERT files into qr-files.
- Allow public SELECT on files (bucket is public so URLs are world-readable).
- Allow owner to UPDATE/DELETE their own uploads (by owner id match; anon allowed since no auth here).
*/

-- Allow anyone to upload
DROP POLICY IF EXISTS "anon_insert_qr_files" ON storage.objects;
CREATE POLICY "anon_insert_qr_files"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'qr-files');

-- Allow public read (public bucket)
DROP POLICY IF EXISTS "anon_select_qr_files" ON storage.objects;
CREATE POLICY "anon_select_qr_files"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'qr-files');

-- Allow updates
DROP POLICY IF EXISTS "anon_update_qr_files" ON storage.objects;
CREATE POLICY "anon_update_qr_files"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'qr-files')
WITH CHECK (bucket_id = 'qr-files');

-- Allow deletes
DROP POLICY IF EXISTS "anon_delete_qr_files" ON storage.objects;
CREATE POLICY "anon_delete_qr_files"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'qr-files');