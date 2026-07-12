-- Phase 2.3 completion: blocked pairs must not see each other in matching.
-- Recreates the three match functions (bodies unchanged from 0013/0019) with
-- one added predicate: no block row in either direction between the viewer
-- and the counterparty. Filtering here covers the feed, the mobile swipe deck,
-- and push-notification candidate selection in one place.

create or replace function public.match_gigs_for_user(
  p_user_id uuid,
  p_limit   int default 20
)
returns table (
  gig_id                uuid,
  title                 text,
  description           text,
  employer_id           uuid,
  skills_required       text[],
  budget_cents          integer,
  budget_kind           text,
  category              text,
  location              text,
  score                 float,
  applications_close_at timestamptz,
  distance_km           double precision
)
language sql stable
set search_path = public
as $$
  select
    g.id,
    g.title,
    g.description,
    g.employer_id,
    g.skills_required,
    g.budget_cents,
    g.budget_kind,
    g.category,
    g.location,
    case
      when p.lat is null or p.lon is null or g.lat is null or g.lon is null then
        (1.0 - (g.embedding <=> p.embedding))::float
      when cardinality(g.skills_required) = 0 then
        (0.3 * (1.0 - (g.embedding <=> p.embedding)) +
         0.7 * public.distance_score(public.haversine_km(p.lat, p.lon, g.lat, g.lon)))::float
      else
        (0.8 * (1.0 - (g.embedding <=> p.embedding)) +
         0.2 * public.distance_score(public.haversine_km(p.lat, p.lon, g.lat, g.lon)))::float
    end as score,
    g.applications_close_at,
    case
      when p.lat is null or p.lon is null or g.lat is null or g.lon is null then null
      else public.haversine_km(p.lat, p.lon, g.lat, g.lon)
    end as distance_km
  from public.gigs g
  join public.profiles p on p.id = p_user_id
  where g.status = 'open'
    and g.embedding is not null
    and p.embedding is not null
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = p_user_id and b.blocked_id = g.employer_id)
         or (b.blocker_id = g.employer_id and b.blocked_id = p_user_id)
    )
  order by score desc
  limit p_limit
$$;

create or replace function public.match_users_for_gig(
  p_gig_id uuid,
  p_limit  int default 20
)
returns table (
  user_id      uuid,
  handle       text,
  display_name text,
  headline     text,
  score        float
)
language sql stable
set search_path = public
as $$
  select
    p.id,
    p.handle,
    p.display_name,
    p.headline,
    case
      when p.lat is null or p.lon is null or g.lat is null or g.lon is null then
        (1.0 - (p.embedding <=> g.embedding))::float
      when cardinality(g.skills_required) = 0 then
        (0.3 * (1.0 - (p.embedding <=> g.embedding)) +
         0.7 * public.distance_score(public.haversine_km(p.lat, p.lon, g.lat, g.lon)))::float
      else
        (0.8 * (1.0 - (p.embedding <=> g.embedding)) +
         0.2 * public.distance_score(public.haversine_km(p.lat, p.lon, g.lat, g.lon)))::float
    end as score
  from public.profiles p
  join public.gigs g on g.id = p_gig_id
  where p.embedding is not null
    and g.embedding is not null
    and p.role in ('freelancer', 'both')
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = p.id and b.blocked_id = g.employer_id)
         or (b.blocker_id = g.employer_id and b.blocked_id = p.id)
    )
  order by score desc
  limit p_limit
$$;

create or replace function public.match_instant_gigs_for_user(
  p_user_id   uuid,
  p_day_start timestamptz,
  p_day_end   timestamptz,
  p_limit     int default 20
)
returns table (
  gig_id          uuid,
  title           text,
  description     text,
  employer_id     uuid,
  location        text,
  lat             double precision,
  lon             double precision,
  budget_cents    integer,
  budget_kind     text,
  instant_urgency text,
  skills_required text[],
  score           float,
  distance_km     double precision
)
language sql stable
set search_path = public
as $$
  select
    g.id,
    g.title,
    g.description,
    g.employer_id,
    g.location,
    g.lat,
    g.lon,
    g.budget_cents,
    g.budget_kind,
    g.instant_urgency,
    g.skills_required,
    case
      when p.lat is null or p.lon is null or g.lat is null or g.lon is null then
        (1.0 - (g.embedding <=> p.embedding))::float
      when cardinality(g.skills_required) = 0 then
        (0.3 * (1.0 - (g.embedding <=> p.embedding)) +
         0.7 * public.distance_score(public.haversine_km(p.lat, p.lon, g.lat, g.lon)))::float
      else
        (0.8 * (1.0 - (g.embedding <=> p.embedding)) +
         0.2 * public.distance_score(public.haversine_km(p.lat, p.lon, g.lat, g.lon)))::float
    end as score,
    case
      when p.lat is null or p.lon is null or g.lat is null or g.lon is null then null
      else public.haversine_km(p.lat, p.lon, g.lat, g.lon)
    end as distance_km
  from public.gigs g
  join public.profiles p on p.id = p_user_id
  where g.is_instant = true
    and g.status = 'open'
    and g.embedding is not null
    and p.embedding is not null
    and (g.start_at is null or (g.start_at >= p_day_start and g.start_at < p_day_end))
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = p_user_id and b.blocked_id = g.employer_id)
         or (b.blocker_id = g.employer_id and b.blocked_id = p_user_id)
    )
  order by score desc
  limit p_limit
$$;
