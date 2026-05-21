-- Public bucket for demo interview video responses
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'demo-videos',
  'demo-videos',
  true,
  52428800,
  ARRAY['video/webm', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read (public bucket, but explicit policy for clarity)
CREATE POLICY "demo_videos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'demo-videos');

-- Allow anyone (including unauthenticated) to upload demo videos
CREATE POLICY "demo_videos_anon_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'demo-videos');

-- Allow overwrite for re-records
CREATE POLICY "demo_videos_anon_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'demo-videos');
