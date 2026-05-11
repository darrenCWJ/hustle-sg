-- Add lat/lon to profiles and rebuild match functions with hybrid distance+cosine scoring.

-- ── 1. Profile coordinates ────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists lat double precision,
  add column if not exists lon double precision;

-- ── 2. Haversine helper (great-circle distance in km) ────────────────────────

create or replace function public.haversine_km(
  lat1 double precision, lon1 double precision,
  lat2 double precision, lon2 double precision
)
returns double precision language sql immutable as $$
  select 2.0 * 6371.0 * asin(sqrt(
    power(sin(radians((lat2 - lat1) / 2.0)), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) *
    power(sin(radians((lon2 - lon1) / 2.0)), 2)
  ))
$$;

-- ── 3. Linear distance decay: 1.0 at 0 km → 0.0 at 15 km (Singapore scale) ──

create or replace function public.distance_score(km double precision)
returns double precision language sql immutable as $$
  select greatest(0.0, 1.0 - km / 15.0)
$$;

-- ── 4. Rebuild match_gigs_for_user with hybrid scoring ────────────────────────
-- Skill gigs:    80% cosine + 20% distance
-- No-skill gigs: 30% cosine + 70% distance  (dog walking, errands, etc.)
-- No coords:     100% cosine

drop function if exists public.match_gigs_for_user(uuid, integer);

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
language sql stable as $$
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
  order by score desc
  limit p_limit
$$;

-- ── 5. Rebuild match_users_for_gig with hybrid scoring (push notifications) ──

drop function if exists public.match_users_for_gig(uuid, integer);

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
language sql stable as $$
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
  order by score desc
  limit p_limit
$$;
