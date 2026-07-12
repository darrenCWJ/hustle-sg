-- Disputes (IMPROVEMENT_PLAN.md Phase 2.4): a minimal dispute flow tied to an
-- application, with an open → under_review → resolved state machine. Either
-- party of the application can open one; triage/resolution happens in the
-- admin surface (service role). The UI may only surface "dispute window" copy
-- now that this exists.

create table if not exists public.disputes (
  id              uuid primary key default gen_random_uuid(),
  application_id  uuid not null references public.applications(id) on delete cascade,
  opened_by       uuid not null references public.profiles(id) on delete cascade,
  reason          text not null check (reason in ('non_payment','work_quality','no_show','scope_change','conduct','other')),
  details         text not null default '' check (char_length(details) <= 4000),
  status          text not null default 'open' check (status in ('open','under_review','resolved')),
  resolution_note text,
  created_at      timestamptz not null default now(),
  resolved_at     timestamptz,
  -- One dispute per party per application; a second submission is a no-op.
  constraint disputes_one_per_party unique (application_id, opened_by)
);

alter table public.disputes enable row level security;

-- Both parties of the application can open and see its disputes. No user-side
-- update/delete: state transitions are an admin (service-role) concern.
create policy disputes_insert_party on public.disputes
  for insert to authenticated
  with check (
    opened_by = (select auth.uid())
    and exists (
      select 1
      from public.applications a
      join public.gigs g on g.id = a.gig_id
      where a.id = disputes.application_id
        and (a.applicant_id = (select auth.uid()) or g.employer_id = (select auth.uid()))
    )
  );

create policy disputes_select_party on public.disputes
  for select to authenticated
  using (
    exists (
      select 1
      from public.applications a
      join public.gigs g on g.id = a.gig_id
      where a.id = disputes.application_id
        and (a.applicant_id = (select auth.uid()) or g.employer_id = (select auth.uid()))
    )
  );

create index if not exists idx_disputes_status_created on public.disputes (status, created_at desc);
create index if not exists idx_disputes_application on public.disputes (application_id);
create index if not exists idx_disputes_opened_by on public.disputes (opened_by);
