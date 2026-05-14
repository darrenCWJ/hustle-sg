-- Time-of-day and day-of-week fields so hired gigs can appear on the worker calendar
alter table public.gigs
  add column if not exists start_time   time,
  add column if not exists end_time     time,
  add column if not exists days_of_week int[] default '{}';
