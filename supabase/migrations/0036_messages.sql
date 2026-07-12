-- In-app messaging (IMPROVEMENT_PLAN.md Phase 3.3): the single biggest journey
-- hole — the two parties of a hire couldn't talk. Threads are scoped to an
-- application and unlock once the employer has signalled real interest
-- (shortlisted / offered / hired / completed); blocked pairs can't message.

create table if not exists public.messages (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  sender_id      uuid not null references public.profiles(id) on delete cascade,
  body           text not null check (char_length(body) between 1 and 2000),
  created_at     timestamptz not null default now(),
  read_at        timestamptz
);

alter table public.messages enable row level security;

-- Both parties of the application can read the thread.
create policy messages_select_parties on public.messages
  for select to authenticated
  using (
    exists (
      select 1
      from public.applications a
      join public.gigs g on g.id = a.gig_id
      where a.id = messages.application_id
        and (a.applicant_id = (select auth.uid()) or g.employer_id = (select auth.uid()))
    )
  );

-- Sending requires: you are the sender, you are a party, the thread is
-- unlocked (mutual-interest statuses only), and no block exists between the
-- two parties. Enforced here so direct PostgREST writes obey it too.
create policy messages_insert_party on public.messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1
      from public.applications a
      join public.gigs g on g.id = a.gig_id
      where a.id = messages.application_id
        and a.status in ('shortlisted', 'offered', 'hired', 'completed')
        and (a.applicant_id = (select auth.uid()) or g.employer_id = (select auth.uid()))
        and not exists (
          select 1 from public.blocks b
          where (b.blocker_id = a.applicant_id and b.blocked_id = g.employer_id)
             or (b.blocker_id = g.employer_id and b.blocked_id = a.applicant_id)
        )
    )
  );

-- No user-side update/delete: read receipts are set server-side (service
-- role) after a party check, and messages are immutable once sent.

create index if not exists idx_messages_application_created
  on public.messages (application_id, created_at);
create index if not exists idx_messages_sender on public.messages (sender_id);

-- New-message notifications need their own kind.
alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check
  check (kind in (
    'application_received', 'application_status_changed', 'interview_submitted',
    'gig_filled', 'cert_verified', 'instant_gig_accepted', 'gig_match',
    'direct_offer', 'message_received'
  ));

-- Live thread updates via Realtime (postgres_changes respects RLS).
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end $$;
