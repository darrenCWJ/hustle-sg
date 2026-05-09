-- Push notification subscriptions + extend notifications kind enum

-- =========================================================================
-- push_subscriptions — stores Web Push API subscriptions per user/device
-- =========================================================================
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;
create policy "owner reads own subscriptions" on public.push_subscriptions
  for select using (user_id = auth.uid());
create policy "owner writes own subscriptions" on public.push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
-- Service role can read all subscriptions to send pushes (bypasses RLS)

-- =========================================================================
-- notifications — add gig_match kind
-- =========================================================================
alter table public.notifications
  drop constraint if exists notifications_kind_check;

alter table public.notifications
  add constraint notifications_kind_check check (kind in (
    'application_received',
    'application_status_changed',
    'interview_submitted',
    'gig_filled',
    'cert_verified',
    'instant_gig_accepted',
    'gig_match'
  ));
