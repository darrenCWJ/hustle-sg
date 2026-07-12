-- Four pieces of follow-on infrastructure:
--
-- 1. app_errors — first-party error store (no external DSN needed): server
--    code and client error boundaries write here; admins read it at
--    /admin/errors. Service-role only.
-- 2. match_events — Phase 6 instrumentation: apply→hire→rate outcomes start
--    accumulating now so matching can be tuned on real signal later.
-- 3. 'opencerts' verification method — OpenCerts (opencerts.io) is Singapore's
--    notarised credential format; verifying one is real evidence, unlike a
--    self-typed issuer name.
-- 4. Review reminders (Phase 2.2 leftover) — pg_cron daily job nudging parties
--    of completed gigs who haven't left their (double-blind) review yet.

-- ── 1. Error store ──────────────────────────────────────────────────────────
create table if not exists public.app_errors (
  id         uuid primary key default gen_random_uuid(),
  source     text not null check (source in ('client', 'server')),
  scope      text not null default '' check (char_length(scope) <= 200),
  message    text not null check (char_length(message) <= 4000),
  stack      text check (char_length(stack) <= 20000),
  digest     text check (char_length(digest) <= 100),
  url        text check (char_length(url) <= 2000),
  user_id    uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.app_errors enable row level security;
-- No policies: only the service role writes (capture helpers) and reads (admin).

create index if not exists idx_app_errors_created on public.app_errors (created_at desc);

-- ── 2. Match-outcome instrumentation ────────────────────────────────────────
create table if not exists public.match_events (
  id         uuid primary key default gen_random_uuid(),
  gig_id     uuid not null references public.gigs(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  event      text not null check (event in ('apply','shortlist','offer','hire','reject','withdraw','complete','rate')),
  score      double precision,
  created_at timestamptz not null default now()
);

alter table public.match_events enable row level security;
-- No policies: written server-side (service role); analysed offline.

create index if not exists idx_match_events_gig on public.match_events (gig_id);
create index if not exists idx_match_events_user on public.match_events (user_id);
create index if not exists idx_match_events_event_created on public.match_events (event, created_at);

-- ── 3. OpenCerts verification method ────────────────────────────────────────
alter table public.certifications drop constraint if exists certifications_verification_method_check;
alter table public.certifications add constraint certifications_verification_method_check
  check (verification_method in ('singpass', 'wsq_api', 'university_api', 'manual', 'opencerts', 'other'));

alter table public.cert_verification_log drop constraint if exists cert_verification_log_method_check;
alter table public.cert_verification_log add constraint cert_verification_log_method_check
  check (method in ('singpass', 'wsq_api', 'university_api', 'manual', 'opencerts', 'other'));

-- ── 4. Review reminders (daily, pg_cron) ────────────────────────────────────
create extension if not exists pg_cron;

create or replace function public.send_review_reminders()
returns integer
language plpgsql security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  with completed as (
    select a.id as application_id, a.applicant_id, g.employer_id, g.title
    from public.applications a
    join public.gigs g on g.id = a.gig_id
    where a.status = 'completed'
  ),
  parties as (
    select application_id, applicant_id as user_id, title from completed
    union all
    select application_id, employer_id, title from completed
  ),
  pending as (
    select p.application_id, p.user_id, p.title
    from parties p
    -- they haven't rated yet…
    where not exists (
      select 1 from public.ratings r
      where r.application_id = p.application_id and r.from_id = p.user_id
    )
    -- …and we haven't nagged them about it in the last 7 days.
    and not exists (
      select 1 from public.notifications n
      where n.user_id = p.user_id
        and n.data->>'kind' = 'rate_reminder'
        and n.data->>'application_id' = p.application_id::text
        and n.created_at > now() - interval '7 days'
    )
  )
  insert into public.notifications (user_id, kind, title, body, link, data)
  select
    user_id,
    'application_status_changed',
    'Leave your review for "' || title || '"',
    'Reviews are double-blind — yours stays hidden until the other side submits theirs, or 14 days pass.',
    '/rate/' || application_id,
    jsonb_build_object('application_id', application_id, 'kind', 'rate_reminder')
  from pending;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.send_review_reminders() from public, anon, authenticated;

-- Idempotent by job name: re-scheduling replaces the existing entry.
select cron.schedule(
  'review-reminders-daily',
  '0 1 * * *', -- 01:00 UTC daily (09:00 SGT)
  $$select public.send_review_reminders()$$
);
