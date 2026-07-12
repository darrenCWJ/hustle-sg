-- Security hardening (Supabase advisor lint 0025_public_bucket_allows_listing):
-- portfolio-media is a public bucket, so objects are served via public URLs
-- without any RLS check. The broad "portfolio public read" SELECT policy on
-- storage.objects therefore only enables one thing: letting any client
-- enumerate every file in the bucket via the storage list API. Nothing in the
-- app lists this bucket, so drop the policy.
--
-- demo-videos has the same lint finding but is intentionally kept: the
-- quick-demo cleanup flow lists session files client-side (DemoProvider.tsx)
-- and needs SELECT on storage.objects for that bucket.

drop policy if exists "portfolio public read" on storage.objects;
