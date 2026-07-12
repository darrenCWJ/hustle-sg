-- Double-blind reviews (IMPROVEMENT_PLAN.md Phase 2.2): a rating stays hidden
-- from everyone except its author until the OTHER party has also rated the
-- same application, or 14 days have passed — so neither side can read the
-- counterparty's review before writing their own (retaliation-proof).
--
-- The check lives in RLS so it also holds for direct PostgREST access. A
-- SECURITY DEFINER helper is required: a same-table subquery inside the
-- ratings policy would recurse into the policy itself.

create or replace function public.both_parties_rated(p_application_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select count(distinct from_id) >= 2
  from public.ratings
  where application_id = p_application_id
$$;

revoke all on function public.both_parties_rated(uuid) from public, anon;
grant execute on function public.both_parties_rated(uuid) to authenticated;

drop policy if exists ratings_select on public.ratings;

create policy ratings_select on public.ratings
  for select to authenticated
  using (
    from_id = (select auth.uid())                    -- author always sees their own
    or created_at < now() - interval '14 days'       -- deadline reveal
    or public.both_parties_rated(application_id)     -- mutual reveal
  );
