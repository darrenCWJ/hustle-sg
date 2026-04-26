-- Full POC schema additions
-- Adds employer approval flow, instant gigs, cert verification, availability, saved gigs, notifications

-- =========================================================================
-- gigs — new columns
-- =========================================================================
alter table public.gigs
  add column if not exists requires_employer_approval boolean not null default true,
  add column if not exists is_instant boolean not null default false,
  add column if not exists instant_urgency text check (instant_urgency in ('now','today','weekend'));

-- =========================================================================
-- certifications — replace boolean with status enum
-- =========================================================================
alter table public.certifications
  add column if not exists verification_status text not null default 'pending'
    check (verification_status in ('pending','verified','rejected','manual_review')),
  add column if not exists verification_method text
    check (verification_method in ('singpass','wsq_api','university_api','manual','other')),
  add column if not exists verified_at timestamptz,
  add column if not exists rejection_reason text;

-- Back-fill: rows already marked verified=true get verified status
update public.certifications
  set verification_status = 'verified',
      verification_method = 'manual',
      verified_at         = now()
  where verified = true and verification_status = 'pending';

-- =========================================================================
-- cert_verification_log — audit trail for each verification attempt
-- =========================================================================
create table if not exists public.cert_verification_log (
  id               uuid primary key default gen_random_uuid(),
  certification_id uuid not null references public.certifications(id) on delete cascade,
  checked_at       timestamptz not null default now(),
  method           text not null,
  raw_response     jsonb,
  success          boolean not null
);

create index if not exists cert_log_cert_idx on public.cert_verification_log(certification_id);

alter table public.cert_verification_log enable row level security;
create policy "owner reads own cert log" on public.cert_verification_log
  for select using (
    exists (
      select 1 from public.certifications c
      where c.id = certification_id and c.user_id = auth.uid()
    )
  );

-- =========================================================================
-- user_availability — weekly availability grid stored as JSONB (7×24 int[])
-- =========================================================================
create table if not exists public.user_availability (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade unique,
  slots      jsonb not null default '[[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists user_availability_user_idx on public.user_availability(user_id);

alter table public.user_availability enable row level security;
create policy "owner reads own availability" on public.user_availability
  for select using (user_id = auth.uid());
create policy "owner writes own availability" on public.user_availability
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create trigger user_availability_touch
before update on public.user_availability
for each row execute function public.touch_updated_at();

-- =========================================================================
-- saved_gigs — bookmarked gigs from the feed
-- =========================================================================
create table if not exists public.saved_gigs (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  gig_id  uuid not null references public.gigs(id) on delete cascade,
  saved_at timestamptz not null default now(),
  unique (user_id, gig_id)
);

create index if not exists saved_gigs_user_idx on public.saved_gigs(user_id);

alter table public.saved_gigs enable row level security;
create policy "owner reads own saved gigs" on public.saved_gigs
  for select using (user_id = auth.uid());
create policy "owner writes own saved gigs" on public.saved_gigs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =========================================================================
-- notifications
-- =========================================================================
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  kind       text not null check (kind in (
               'application_received','application_status_changed',
               'interview_submitted','gig_filled','cert_verified','instant_gig_accepted'
             )),
  title      text not null,
  body       text,
  link       text,
  data       jsonb not null default '{}'::jsonb,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications(user_id);
create index if not exists notifications_read_idx  on public.notifications(user_id, read_at) where read_at is null;

alter table public.notifications enable row level security;
create policy "owner reads own notifications" on public.notifications
  for select using (user_id = auth.uid());
create policy "owner updates own notifications" on public.notifications
  for update using (user_id = auth.uid());
-- System writes via service role (no insert policy — service client bypasses RLS)

-- =========================================================================
-- RPC: decide_application
-- Employer hires / shortlists / declines an applicant. Validates ownership.
-- Emits a notification to the applicant.
-- =========================================================================
create or replace function public.decide_application(
  p_app_id    uuid,
  p_decision  text,   -- 'hired' | 'shortlisted' | 'rejected'
  p_actor_id  uuid
)
returns jsonb
language plpgsql security definer as $$
declare
  v_app   record;
  v_new   text;
  v_notif_kind text;
  v_notif_title text;
  v_notif_body  text;
begin
  if p_decision not in ('hired','shortlisted','rejected') then
    raise exception 'decision must be hired, shortlisted, or rejected';
  end if;

  -- Map shortlisted → interviewing (our status enum)
  v_new := case p_decision
    when 'shortlisted' then 'interviewing'
    else p_decision
  end;

  select a.*, g.employer_id, g.title as gig_title
  into   v_app
  from   public.applications a
  join   public.gigs g on g.id = a.gig_id
  where  a.id = p_app_id;

  if not found then
    raise exception 'application not found';
  end if;

  if v_app.employer_id <> p_actor_id then
    raise exception 'not authorised';
  end if;

  update public.applications set status = v_new where id = p_app_id;

  -- Notification labels
  v_notif_kind  := 'application_status_changed';
  v_notif_title := case p_decision
    when 'hired'       then 'You got hired!'
    when 'shortlisted' then 'You''ve been shortlisted'
    when 'rejected'    then 'Application update'
  end;
  v_notif_body := case p_decision
    when 'hired'       then 'Congratulations — you''ve been hired for "' || v_app.gig_title || '".'
    when 'shortlisted' then 'You''ve been shortlisted for "' || v_app.gig_title || '". An interview may follow.'
    when 'rejected'    then 'Your application for "' || v_app.gig_title || '" was not selected this time.'
  end;

  insert into public.notifications (user_id, kind, title, body, link, data)
  values (
    v_app.applicant_id,
    v_notif_kind,
    v_notif_title,
    v_notif_body,
    '/interviews/' || p_app_id,
    jsonb_build_object('application_id', p_app_id, 'decision', p_decision)
  );

  return jsonb_build_object('ok', true, 'new_status', v_new);
end $$;

-- =========================================================================
-- RPC: accept_instant_gig
-- Freelancer accepts an instant gig → creates application with hired status
-- =========================================================================
create or replace function public.accept_instant_gig(
  p_gig_id   uuid,
  p_user_id  uuid
)
returns jsonb
language plpgsql security definer as $$
declare
  v_gig record;
  v_app_id uuid;
begin
  select id, title, employer_id, status into v_gig
  from   public.gigs
  where  id = p_gig_id and is_instant = true;

  if not found then
    raise exception 'instant gig not found';
  end if;

  if v_gig.status <> 'open' then
    raise exception 'gig is no longer available';
  end if;

  insert into public.applications (gig_id, applicant_id, status)
  values (p_gig_id, p_user_id, 'hired')
  on conflict (gig_id, applicant_id)
  do update set status = 'hired'
  returning id into v_app_id;

  -- Notify employer
  insert into public.notifications (user_id, kind, title, body, link, data)
  values (
    v_gig.employer_id,
    'instant_gig_accepted',
    'Instant gig accepted',
    'Someone accepted your instant gig "' || v_gig.title || '".',
    '/gigs/' || p_gig_id,
    jsonb_build_object('gig_id', p_gig_id, 'applicant_id', p_user_id)
  );

  return jsonb_build_object('ok', true, 'application_id', v_app_id);
end $$;
