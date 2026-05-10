alter table public.gigs
  add column if not exists applications_close_at timestamptz;
