-- Row-Level Security for Hustle SG
-- Principle: public read for discovery surfaces, strict write controls, private for sensitive data.

alter table public.profiles enable row level security;
alter table public.certifications enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.gigs enable row level security;
alter table public.applications enable row level security;
alter table public.interview_questions enable row level security;
alter table public.interview_responses enable row level security;
alter table public.company_registrations enable row level security;

-- profiles: public read (for discovery); owner writes own row
create policy "profiles are public" on public.profiles
  for select using (true);
create policy "user updates own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "user inserts own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- certifications: read if verified or own; owner writes
create policy "verified or own certs readable" on public.certifications
  for select using (verified = true or user_id = auth.uid());
create policy "owner writes own certs" on public.certifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- portfolio_items: public read; owner writes
create policy "portfolio public read" on public.portfolio_items
  for select using (true);
create policy "owner writes portfolio" on public.portfolio_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- gigs: open gigs are public; employer writes own; employer reads all theirs
create policy "open gigs public" on public.gigs
  for select using (status = 'open' or employer_id = auth.uid());
create policy "employer writes own gigs" on public.gigs
  for all using (employer_id = auth.uid()) with check (employer_id = auth.uid());

-- applications: applicant + gig employer can read; applicant writes own
create policy "application visible to parties" on public.applications
  for select using (
    applicant_id = auth.uid()
    or exists (select 1 from public.gigs g where g.id = gig_id and g.employer_id = auth.uid())
  );
create policy "applicant creates own application" on public.applications
  for insert with check (applicant_id = auth.uid());
create policy "applicant updates own application" on public.applications
  for update using (applicant_id = auth.uid())
  with check (applicant_id = auth.uid());
create policy "employer updates application status" on public.applications
  for update using (
    exists (select 1 from public.gigs g where g.id = gig_id and g.employer_id = auth.uid())
  );

-- interview_questions: public read (so applicants can prepare); employer writes
create policy "interview questions public" on public.interview_questions
  for select using (true);
create policy "employer writes interview questions" on public.interview_questions
  for all using (
    exists (select 1 from public.gigs g where g.id = gig_id and g.employer_id = auth.uid())
  );

-- interview_responses: only applicant + gig employer
create policy "response visible to parties" on public.interview_responses
  for select using (
    exists (
      select 1 from public.applications a
      left join public.gigs g on g.id = a.gig_id
      where a.id = application_id
        and (a.applicant_id = auth.uid() or g.employer_id = auth.uid())
    )
  );
create policy "applicant writes own responses" on public.interview_responses
  for insert with check (
    exists (select 1 from public.applications a where a.id = application_id and a.applicant_id = auth.uid())
  );

-- company_registrations: strictly owner only
create policy "owner accesses own company registration" on public.company_registrations
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
