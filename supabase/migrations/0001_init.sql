-- Hustle SG — initial schema
-- Freelancers, certifications, portfolio, gigs, applications, interviews, company registrations.

create extension if not exists "pgcrypto";

-- =========================================================================
-- profiles — augments auth.users with Hustle-specific fields
-- =========================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null check (handle ~ '^[a-z0-9_-]{3,32}$'),
  display_name text not null,
  headline text,
  bio text,
  avatar_url text,
  role text not null check (role in ('freelancer','employer','both')) default 'freelancer',
  nric_hash text,                       -- sha-256 of NRIC (mock Singpass)
  singpass_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);

-- =========================================================================
-- certifications
-- =========================================================================
create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('wsq','university','accreditation','other')),
  issuer text not null,
  title text not null,
  issued_at date,
  doc_url text,
  verified boolean not null default false,
  extracted_skills text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index certifications_user_idx on public.certifications(user_id);
create index certifications_verified_idx on public.certifications(verified);

-- =========================================================================
-- portfolio_items
-- =========================================================================
create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('video','website','image','writeup')),
  media_url text,
  external_url text,
  title text not null,
  description text,
  tags text[] not null default '{}',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index portfolio_user_idx on public.portfolio_items(user_id);

-- =========================================================================
-- gigs
-- =========================================================================
create table public.gigs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  skills_required text[] not null default '{}',
  location text,                         -- "Tanjong Pagar", "Remote"
  budget_cents integer,                  -- SGD cents
  budget_kind text not null check (budget_kind in ('fixed','hourly')) default 'fixed',
  category text,                         -- "design","tuition","f&b","tech","events"
  status text not null check (status in ('open','closed','filled')) default 'open',
  created_at timestamptz not null default now()
);

create index gigs_status_idx on public.gigs(status);
create index gigs_employer_idx on public.gigs(employer_id);

-- =========================================================================
-- applications
-- =========================================================================
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gigs(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  cover_note text,
  status text not null check (status in ('applied','interviewing','hired','rejected','withdrawn')) default 'applied',
  created_at timestamptz not null default now(),
  unique (gig_id, applicant_id)
);

create index applications_gig_idx on public.applications(gig_id);
create index applications_applicant_idx on public.applications(applicant_id);

-- =========================================================================
-- interview_questions & interview_responses
-- =========================================================================
create table public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gigs(id) on delete cascade,
  prompt text not null,
  max_duration_sec integer not null default 90,
  display_order integer not null default 0
);

create index interview_questions_gig_idx on public.interview_questions(gig_id);

create table public.interview_responses (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  question_id uuid not null references public.interview_questions(id) on delete cascade,
  video_url text not null,
  duration_sec integer,
  created_at timestamptz not null default now()
);

create index interview_responses_app_idx on public.interview_responses(application_id);

-- =========================================================================
-- company_registrations (entrepreneur onboarding)
-- =========================================================================
create table public.company_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade unique,
  entity_type text check (entity_type in ('sole_prop','pte_ltd')),
  proposed_name text,
  business_activities text[] not null default '{}',
  stage text not null check (stage in ('exploring','name_reserved','registered')) default 'exploring',
  mock_acra_id text,
  checklist_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================================
-- updated_at trigger helper
-- =========================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger profiles_touch
before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger company_reg_touch
before update on public.company_registrations
for each row execute function public.touch_updated_at();
