-- Security fix (IMPROVEMENT_PLAN.md Phase 0.8 / finding H3):
-- portfolio-media, interview-responses and certifications were created with no
-- file_size_limit and no allowed_mime_types, so an authenticated user could
-- upload arbitrarily large or arbitrary-type files (storage-cost abuse; the
-- public portfolio bucket doubled as a free file host). Set bounded limits to
-- match the pattern already used for the demo-videos bucket.

update storage.buckets
  set file_size_limit = 52428800, -- 50 MB
      allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif','video/webm','video/mp4']
  where id = 'portfolio-media';

update storage.buckets
  set file_size_limit = 52428800, -- 50 MB
      allowed_mime_types = array['video/webm','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus']
  where id = 'interview-responses';

update storage.buckets
  set file_size_limit = 10485760, -- 10 MB
      allowed_mime_types = array['application/pdf','image/png','image/jpeg','image/webp']
  where id = 'certifications';
