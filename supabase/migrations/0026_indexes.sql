-- Performance (IMPROVEMENT_PLAN.md Phase 4.4): add indexes on the hot query
-- paths that currently do sequential scans. Pure performance change — no
-- behaviour or data change. All guarded with IF NOT EXISTS for idempotency.

-- Instant board + mobile feed filter on (is_instant, status) on every load.
create index if not exists idx_gigs_instant_status
  on public.gigs (is_instant, status);

-- Similar-gig lookups filter by category.
create index if not exists idx_gigs_category
  on public.gigs (category);

-- Dashboard / applicants pages filter an employer's gigs by status.
create index if not exists idx_gigs_employer_status
  on public.gigs (employer_id, status);

-- Headcount auto-close and close-gig count applications per gig by status.
create index if not exists idx_applications_gig_status
  on public.applications (gig_id, status);
-- NOTE: applications(applicant_id) is already indexed by applications_applicant_idx
-- (0001_init.sql); no separate index added here to avoid a redundant duplicate.

-- Profile reputation aggregates ratings by recipient / gig.
create index if not exists idx_ratings_to_id
  on public.ratings (to_id);
create index if not exists idx_ratings_gig_id
  on public.ratings (gig_id);

-- Index the ratings foreign keys: application_id is scanned on cascade delete,
-- and from_id backs the ratings_insert RLS check (from_id = auth.uid()).
create index if not exists idx_ratings_application_id
  on public.ratings (application_id);
create index if not exists idx_ratings_from_id
  on public.ratings (from_id);
