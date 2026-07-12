-- Trust & safety groundwork (IMPROVEMENT_PLAN.md Phase 2.3): users need a way
-- to report bad actors/content and to block another user. Triage of reports
-- happens later via the role-gated admin surface (Phase 2.5, service role);
-- until then rows accumulate with status 'open'.

-- ── Reports ────────────────────────────────────────────────────────────────
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_kind text not null check (target_kind in ('user','gig','rating')),
  target_id   uuid not null,
  reason      text not null check (reason in ('scam','harassment','fake_listing','inappropriate','spam','other')),
  details     text not null default '' check (char_length(details) <= 2000),
  status      text not null default 'open' check (status in ('open','under_review','resolved','dismissed')),
  created_at  timestamptz not null default now(),
  -- One report per reporter per target: repeat submissions are a no-op, not spam.
  constraint reports_one_per_target unique (reporter_id, target_kind, target_id)
);

alter table public.reports enable row level security;

-- Reporters can file and see their own reports. No user-side update/delete:
-- status changes are an admin (service-role) concern.
create policy reports_insert_own on public.reports
  for insert to authenticated
  with check (reporter_id = auth.uid());

create policy reports_select_own on public.reports
  for select to authenticated
  using (reporter_id = auth.uid());

create index if not exists idx_reports_status_created on public.reports (status, created_at desc);
create index if not exists idx_reports_target on public.reports (target_kind, target_id);
create index if not exists idx_reports_reporter on public.reports (reporter_id);

-- ── Blocks ─────────────────────────────────────────────────────────────────
create table if not exists public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_not_self check (blocker_id <> blocked_id)
);

alter table public.blocks enable row level security;

-- Owners manage their own block list. The blocked party cannot see the row —
-- cross-pair enforcement checks run server-side with the service role.
create policy blocks_manage_own on public.blocks
  for all to authenticated
  using (blocker_id = auth.uid())
  with check (blocker_id = auth.uid());

create index if not exists idx_blocks_blocked on public.blocks (blocked_id);
