-- Rating-ring / collusion detection, v1 (statistical): an employer and a
-- worker can create gigs for each other, "complete" them instantly, and trade
-- five-star reviews to inflate ratings and game matching. This function
-- computes per-pair behavioural signals for the admin fraud queue:
--
--   * gigs_between / completed_between — volume of the relationship
--   * mutual_five_star — applications where BOTH sides rated and 5★s flowed
--   * silent_completions — completed without a single message exchanged
--   * fast_rated — a rating landed within 60 minutes of the application
--
-- The score is a transparent weighted sum, not a black box. match_events keeps
-- accumulating outcome data, so a trained model can replace the weights later
-- without changing the surface. Service-role only (admin queue reads it).

create or replace function public.collusion_pairs(p_min_score integer default 2)
returns table (
  employer_id        uuid,
  worker_id          uuid,
  gigs_between       integer,
  completed_between  integer,
  mutual_five_star   integer,
  ratings_between    integer,
  silent_completions integer,
  fast_rated         integer,
  suspicion_score    integer
)
language sql stable security definer
set search_path = public
as $$
  with pair_apps as (
    select
      g.employer_id,
      a.applicant_id as worker_id,
      a.id           as application_id,
      a.status,
      a.created_at
    from public.applications a
    join public.gigs g on g.id = a.gig_id
  ),
  msgs as (
    select application_id, count(*) as msg_count
    from public.messages
    group by application_id
  ),
  rts as (
    select
      application_id,
      count(*)                              as rating_count,
      count(*) filter (where stars = 5)     as five_count,
      min(created_at)                       as first_rating_at
    from public.ratings
    group by application_id
  ),
  pair_stats as (
    select
      pa.employer_id,
      pa.worker_id,
      count(*)::int as gigs_between,
      count(*) filter (where pa.status = 'completed')::int as completed_between,
      count(*) filter (where coalesce(r.rating_count, 0) >= 2 and coalesce(r.five_count, 0) >= 2)::int as mutual_five_star,
      coalesce(sum(r.rating_count), 0)::int as ratings_between,
      count(*) filter (where pa.status = 'completed' and coalesce(m.msg_count, 0) = 0)::int as silent_completions,
      count(*) filter (where r.first_rating_at is not null
                         and r.first_rating_at < pa.created_at + interval '60 minutes')::int as fast_rated
    from pair_apps pa
    left join msgs m on m.application_id = pa.application_id
    left join rts  r on r.application_id = pa.application_id
    group by pa.employer_id, pa.worker_id
  )
  select
    employer_id,
    worker_id,
    gigs_between,
    completed_between,
    mutual_five_star,
    ratings_between,
    silent_completions,
    fast_rated,
    (2 * mutual_five_star
      + silent_completions
      + fast_rated
      + case when gigs_between >= 3 then 2 else 0 end)::int as suspicion_score
  from pair_stats
  where (2 * mutual_five_star
      + silent_completions
      + fast_rated
      + case when gigs_between >= 3 then 2 else 0 end) >= p_min_score
  order by suspicion_score desc, gigs_between desc
$$;

revoke all on function public.collusion_pairs(integer) from public, anon, authenticated;
grant execute on function public.collusion_pairs(integer) to service_role;
