-- Return applications_close_at from match_gigs_for_user so feed cards can show closed state.
-- Must drop-and-recreate because PostgreSQL disallows changing a function's return type in place.

drop function if exists public.match_gigs_for_user(uuid, integer);

create or replace function public.match_gigs_for_user(
  p_user_id uuid,
  p_limit int default 20
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
  applications_close_at timestamptz
)
language sql stable as $$
  select g.id, g.title, g.description, g.employer_id,
         g.skills_required, g.budget_cents, g.budget_kind,
         g.category, g.location,
         1 - (g.embedding <=> p.embedding) as score,
         g.applications_close_at
  from public.gigs g
  join public.profiles p on p.id = p_user_id
  where g.status = 'open'
    and g.embedding is not null
    and p.embedding is not null
  order by g.embedding <=> p.embedding
  limit p_limit
$$;
