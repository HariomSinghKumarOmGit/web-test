-- ====================================================================
-- Walkaroo Supabase Storage Setup: 'walkaroo-assets'
-- Project: https://supabase.com/dashboard/project/zalicyoqqrfdhcsfhpau
-- ====================================================================

-- 1. Create the public storage bucket for Walkaroo images & assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'walkaroo-assets',
    'walkaroo-assets',
    true,
    52428800, -- 50 MB max per file
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE 
SET public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Allow public access to read and retrieve images from Supabase CDN
DROP POLICY IF EXISTS "Public can view walkaroo assets" ON storage.objects;
CREATE POLICY "Public can view walkaroo assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'walkaroo-assets');

-- 3. Allow uploads (from client or server batch scripts) to walkaroo-assets
DROP POLICY IF EXISTS "Public can upload walkaroo assets" ON storage.objects;
CREATE POLICY "Public can upload walkaroo assets" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'walkaroo-assets');

-- 4. Allow updates & upserts
DROP POLICY IF EXISTS "Public can update walkaroo assets" ON storage.objects;
CREATE POLICY "Public can update walkaroo assets" ON storage.objects
    FOR UPDATE USING (bucket_id = 'walkaroo-assets');

-- 5. Allow deletes if needed
DROP POLICY IF EXISTS "Public can delete walkaroo assets" ON storage.objects;
CREATE POLICY "Public can delete walkaroo assets" ON storage.objects
    FOR DELETE USING (bucket_id = 'walkaroo-assets');
