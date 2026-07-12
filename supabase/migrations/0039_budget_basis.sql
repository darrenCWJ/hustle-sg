-- Not every gig is paid by the hour or a simple lump sum: real engagements
-- are also PROJECT-based (one price for the whole deliverable) or
-- MILESTONE-based (paid out per milestone — the gigs.milestones jsonb the
-- posting form already collects). Widen the budget-basis allow-list; existing
-- 'fixed'/'hourly' rows are unaffected.

alter table public.gigs drop constraint if exists gigs_budget_kind_check;
alter table public.gigs add constraint gigs_budget_kind_check
  check (budget_kind in ('fixed', 'hourly', 'project', 'milestone'));
