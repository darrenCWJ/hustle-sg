-- Security hardening (Supabase advisor lint 0011_function_search_path_mutable):
-- these functions had no pinned search_path, so a role with CREATE on another
-- schema in the path could shadow objects they reference (classic SECURITY
-- DEFINER/trigger foot-gun). Pin search_path to public without changing any
-- function body. decide_application / accept_instant_gig / check_rate_limit
-- already pin it at definition (migrations 0024, 0027).

alter function public.touch_updated_at() set search_path = public;
alter function public.haversine_km(double precision, double precision, double precision, double precision) set search_path = public;
alter function public.distance_score(double precision) set search_path = public;
alter function public.match_gigs_for_user(uuid, integer) set search_path = public;
alter function public.match_users_for_gig(uuid, integer) set search_path = public;
alter function public.match_instant_gigs_for_user(uuid, timestamptz, timestamptz, integer) set search_path = public;
