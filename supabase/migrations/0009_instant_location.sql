-- Add lat/lon for proximity matching and start_at for same-day filtering.
alter table public.gigs
  add column if not exists lat double precision,
  add column if not exists lon double precision,
  add column if not exists start_at timestamptz;
