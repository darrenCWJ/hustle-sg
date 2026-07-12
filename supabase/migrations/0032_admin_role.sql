-- Phase 2.5: internal admin/moderation surface needs a real role. Admins are
-- promoted manually via SQL (no self-serve path, no UI):
--   update public.profiles set is_admin = true where handle = '<handle>';
-- The flag gates the /admin routes server-side; admin mutations run with the
-- service role, so no additional RLS policies are granted to the flag itself.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;
