-- Fraud-model evaluation loop:
--
-- 1. app_settings — small key/value store so admins can tune the fraud
--    model's signal weights and alert threshold from the UI (no code, no
--    SQL). Service-role only.
-- 2. fraud_reviews — admin verdicts on flagged employer↔worker pairs. These
--    are the GROUND-TRUTH labels: precision/recall/F1 are computed against
--    them to tell admins when the model needs retuning or rebuilding, and
--    they are the training set for a future learned model. A verdict also
--    has teeth: ratings between a confirmed pair stop counting toward
--    public averages.

create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;
-- No policies: service-role reads/writes only (admin actions).

create table if not exists public.fraud_reviews (
  id              uuid primary key default gen_random_uuid(),
  employer_id     uuid not null references public.profiles(id) on delete cascade,
  worker_id       uuid not null references public.profiles(id) on delete cascade,
  verdict         text not null check (verdict in ('confirmed', 'legitimate')),
  score_at_review integer not null,
  signals         jsonb not null default '{}'::jsonb,
  notes           text not null default '' check (char_length(notes) <= 2000),
  reviewed_by     uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  -- One live verdict per pair; re-reviewing replaces it (upsert).
  constraint fraud_reviews_one_per_pair unique (employer_id, worker_id)
);

alter table public.fraud_reviews enable row level security;
-- No policies: verdicts are recorded and read by the admin surface only.

create index if not exists idx_fraud_reviews_verdict on public.fraud_reviews (verdict);
create index if not exists idx_fraud_reviews_worker on public.fraud_reviews (worker_id);
