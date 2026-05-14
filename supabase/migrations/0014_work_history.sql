-- Work history entries per user profile

create table if not exists public.work_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  company     text not null,
  title       text not null,
  description text,
  start_date  text not null,  -- "YYYY-MM" format, loose string for flexibility
  end_date    text,           -- null = current role
  is_current  boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.work_history enable row level security;

create policy "Users manage own work history"
  on public.work_history
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Public read work history"
  on public.work_history
  for select
  using (true);

create index if not exists work_history_user_id_idx on public.work_history(user_id);
