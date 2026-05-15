-- Personalized instant-gig matching for the mobile swipe feed.
-- Same hybrid scoring as match_gigs_for_user (0013) but filtered to
-- instant gigs within SGT day bounds and returning all MobileGig fields.

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
language sql stable as $$
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
  order by score desc
  limit p_limit
$$;
