-- Schema & RLS rebuild (advisor-driven hardening; no data movement).
--
-- Fixes, in one transaction:
--  1. auth_rls_initplan (29 findings): every policy called auth.uid() per ROW;
--     rewritten as (select auth.uid()) so Postgres evaluates it once per query.
--  2. multiple_permissive_policies (54 findings): FOR ALL owner policies also
--     acted as a second SELECT policy next to the public/parties SELECT policy,
--     so every read evaluated two predicates. Owner policies are now split into
--     INSERT/UPDATE/DELETE, leaving exactly one SELECT policy per table; the
--     three fully-redundant "owner reads own X" SELECT policies are dropped and
--     the two overlapping applications UPDATE policies are merged.
--  3. unindexed_foreign_keys: interview_responses.question_id, saved_gigs.gig_id.
--  4. Missing integrity constraints validated against live data before adding:
--     one interview response per question per application, cert_verification_log
--     method allow-list, non-negative rate-limit counters.
--
-- Deliberately unchanged: demo_sessions (anonymous-by-code demo infra),
-- ratings visibility (stays authenticated-only), all public read surfaces
-- (profiles, open gigs, portfolio, work history, interview questions,
-- verified certs) — anonymous visitors keep exactly the reads they had.

-- ── 1+2. Policy rebuild ─────────────────────────────────────────────────────

-- applications
drop policy if exists "applicant creates own application" on public.applications;
drop policy if exists "application visible to parties" on public.applications;
drop policy if exists "applicant updates own application" on public.applications;
drop policy if exists "employer updates application status" on public.applications;

create policy applications_insert_own on public.applications
  for insert to authenticated
  with check (applicant_id = (select auth.uid()));

create policy applications_select_parties on public.applications
  for select to authenticated
  using (
    applicant_id = (select auth.uid())
    or exists (
      select 1 from public.gigs g
      where g.id = applications.gig_id and g.employer_id = (select auth.uid())
    )
  );

create policy applications_update_parties on public.applications
  for update to authenticated
  using (
    applicant_id = (select auth.uid())
    or exists (
      select 1 from public.gigs g
      where g.id = applications.gig_id and g.employer_id = (select auth.uid())
    )
  )
  with check (
    applicant_id = (select auth.uid())
    or exists (
      select 1 from public.gigs g
      where g.id = applications.gig_id and g.employer_id = (select auth.uid())
    )
  );

-- blocks
drop policy if exists blocks_manage_own on public.blocks;
create policy blocks_manage_own on public.blocks
  for all to authenticated
  using (blocker_id = (select auth.uid()))
  with check (blocker_id = (select auth.uid()));

-- cert_verification_log
drop policy if exists "owner reads own cert log" on public.cert_verification_log;
create policy cert_log_select_own on public.cert_verification_log
  for select to authenticated
  using (exists (
    select 1 from public.certifications c
    where c.id = cert_verification_log.certification_id
      and c.user_id = (select auth.uid())
  ));

-- certifications
drop policy if exists "owner writes own certs" on public.certifications;
drop policy if exists "verified or own certs readable" on public.certifications;

create policy certifications_select on public.certifications
  for select
  using (verified = true or user_id = (select auth.uid()));

create policy certifications_insert_own on public.certifications
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy certifications_update_own on public.certifications
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy certifications_delete_own on public.certifications
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- company_registrations
drop policy if exists "owner accesses own company registration" on public.company_registrations;
create policy company_registrations_own on public.company_registrations
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- gigs
drop policy if exists "employer writes own gigs" on public.gigs;
drop policy if exists "open gigs public" on public.gigs;

create policy gigs_select on public.gigs
  for select
  using (status = 'open' or employer_id = (select auth.uid()));

create policy gigs_insert_own on public.gigs
  for insert to authenticated
  with check (employer_id = (select auth.uid()));

create policy gigs_update_own on public.gigs
  for update to authenticated
  using (employer_id = (select auth.uid()))
  with check (employer_id = (select auth.uid()));

create policy gigs_delete_own on public.gigs
  for delete to authenticated
  using (employer_id = (select auth.uid()));

-- interview_questions
drop policy if exists "employer writes interview questions" on public.interview_questions;
drop policy if exists "interview questions public" on public.interview_questions;

create policy interview_questions_select on public.interview_questions
  for select
  using (true);

create policy interview_questions_insert_employer on public.interview_questions
  for insert to authenticated
  with check (exists (
    select 1 from public.gigs g
    where g.id = interview_questions.gig_id and g.employer_id = (select auth.uid())
  ));

create policy interview_questions_update_employer on public.interview_questions
  for update to authenticated
  using (exists (
    select 1 from public.gigs g
    where g.id = interview_questions.gig_id and g.employer_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.gigs g
    where g.id = interview_questions.gig_id and g.employer_id = (select auth.uid())
  ));

create policy interview_questions_delete_employer on public.interview_questions
  for delete to authenticated
  using (exists (
    select 1 from public.gigs g
    where g.id = interview_questions.gig_id and g.employer_id = (select auth.uid())
  ));

-- interview_responses
drop policy if exists "applicant writes own responses" on public.interview_responses;
drop policy if exists "response visible to parties" on public.interview_responses;

create policy interview_responses_insert_applicant on public.interview_responses
  for insert to authenticated
  with check (exists (
    select 1 from public.applications a
    where a.id = interview_responses.application_id
      and a.applicant_id = (select auth.uid())
  ));

create policy interview_responses_select_parties on public.interview_responses
  for select to authenticated
  using (exists (
    select 1
    from public.applications a
    left join public.gigs g on g.id = a.gig_id
    where a.id = interview_responses.application_id
      and (a.applicant_id = (select auth.uid()) or g.employer_id = (select auth.uid()))
  ));

-- notifications
drop policy if exists "owner reads own notifications" on public.notifications;
drop policy if exists "owner updates own notifications" on public.notifications;

create policy notifications_select_own on public.notifications
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy notifications_update_own on public.notifications
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- portfolio_items
drop policy if exists "owner writes portfolio" on public.portfolio_items;
drop policy if exists "portfolio public read" on public.portfolio_items;

create policy portfolio_items_select on public.portfolio_items
  for select
  using (true);

create policy portfolio_items_insert_own on public.portfolio_items
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy portfolio_items_update_own on public.portfolio_items
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy portfolio_items_delete_own on public.portfolio_items
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- profiles
drop policy if exists "user inserts own profile" on public.profiles;
drop policy if exists "profiles are public" on public.profiles;
drop policy if exists "user updates own profile" on public.profiles;

create policy profiles_select on public.profiles
  for select
  using (true);

create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- push_subscriptions (single owner policy; redundant SELECT dropped)
drop policy if exists "owner writes own subscriptions" on public.push_subscriptions;
drop policy if exists "owner reads own subscriptions" on public.push_subscriptions;

create policy push_subscriptions_own on public.push_subscriptions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ratings (visibility unchanged: authenticated-only)
drop policy if exists ratings_insert on public.ratings;
drop policy if exists ratings_select on public.ratings;

create policy ratings_select on public.ratings
  for select to authenticated
  using (true);

create policy ratings_insert_own on public.ratings
  for insert to authenticated
  with check (from_id = (select auth.uid()));

-- reports
drop policy if exists reports_insert_own on public.reports;
drop policy if exists reports_select_own on public.reports;

create policy reports_insert_own on public.reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()));

create policy reports_select_own on public.reports
  for select to authenticated
  using (reporter_id = (select auth.uid()));

-- saved_gigs (single owner policy; redundant SELECT dropped)
drop policy if exists "owner writes own saved gigs" on public.saved_gigs;
drop policy if exists "owner reads own saved gigs" on public.saved_gigs;

create policy saved_gigs_own on public.saved_gigs
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- user_availability (single owner policy; redundant SELECT dropped)
drop policy if exists "owner writes own availability" on public.user_availability;
drop policy if exists "owner reads own availability" on public.user_availability;

create policy user_availability_own on public.user_availability
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- work_history
drop policy if exists "Users manage own work history" on public.work_history;
drop policy if exists "Public read work history" on public.work_history;

create policy work_history_select on public.work_history
  for select
  using (true);

create policy work_history_insert_own on public.work_history
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy work_history_update_own on public.work_history
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy work_history_delete_own on public.work_history
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ── 3. Missing foreign-key indexes ──────────────────────────────────────────

create index if not exists idx_interview_responses_question_id
  on public.interview_responses (question_id);

create index if not exists idx_saved_gigs_gig_id
  on public.saved_gigs (gig_id);

-- ── 4. Missing integrity constraints (live data pre-validated: 0 violations) ─

-- A user can answer each interview question once per application.
alter table public.interview_responses
  add constraint interview_responses_one_per_question
  unique (application_id, question_id);

-- Verification log methods use the same allow-list as certifications.
alter table public.cert_verification_log
  add constraint cert_verification_log_method_check
  check (method in ('singpass', 'wsq_api', 'university_api', 'manual', 'other'));

-- Rate-limit counters can never go negative.
alter table public.rate_limits
  add constraint rate_limits_count_nonnegative
  check (count >= 0);
