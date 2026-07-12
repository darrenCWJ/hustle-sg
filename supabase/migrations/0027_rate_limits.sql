-- Rate limiting (IMPROVEMENT_PLAN.md Phase 1.7 / finding M4): the AI-invoking
-- server actions had no throttle, so an authenticated user could script repeated
-- Claude/OpenAI calls and run up API billing. A Postgres fixed-window token
-- bucket keyed by user id caps this without any external service.

create table if not exists public.rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  count        integer not null default 0
);

alter table public.rate_limits enable row level security;
-- No policies: only the service role (which bypasses RLS) reads/writes this table.

-- Atomically record a hit and report whether it is within the limit for the
-- current fixed window. SECURITY DEFINER so it runs regardless of table RLS.
create or replace function public.check_rate_limit(
  p_key            text,
  p_limit          integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now   timestamptz := now();
  v_count integer;
begin
  insert into public.rate_limits (key, window_start, count)
  values (p_key, v_now, 1)
  on conflict (key) do update
    set count = case
          when rate_limits.window_start < v_now - make_interval(secs => p_window_seconds)
            then 1
          else rate_limits.count + 1
        end,
        window_start = case
          when rate_limits.window_start < v_now - make_interval(secs => p_window_seconds)
            then v_now
          else rate_limits.window_start
        end
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

-- Only the service role (used by server-side limiter calls) may execute it.
revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;
