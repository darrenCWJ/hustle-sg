-- =========================================================================
-- gig timing fields: start date, end date, and duration label
-- =========================================================================
alter table public.gigs
  add column if not exists starts_at       date,
  add column if not exists ends_at         date,
  add column if not exists duration_label  text;
