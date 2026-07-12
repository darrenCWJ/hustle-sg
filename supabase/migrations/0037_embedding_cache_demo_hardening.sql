-- Phase 4.4 data-layer hygiene, two parts:
--
-- 1. Embedding cache: every profile/gig save re-embedded via a paid OpenAI
--    call even when the embedding input hadn't changed. Store a hash of the
--    input text so unchanged saves skip the call (checked in lib/ai/match.ts).
--
-- 2. demo_sessions hardening (advisor: USING(true) policy). Anonymous access
--    by session code is the demo's design, but the table must not be usable
--    as a free anonymous JSON store: constrain id format (genCode emits
--    6-char base36) and cap state size. Live data pre-validated: 0 violations,
--    max state 2.5 KB.

alter table public.profiles add column if not exists embedding_input_hash text;
alter table public.gigs     add column if not exists embedding_input_hash text;

alter table public.demo_sessions
  add constraint demo_sessions_id_format check (id ~ '^[A-Za-z0-9_-]{4,32}$');

alter table public.demo_sessions
  add constraint demo_sessions_state_size check (length(state::text) <= 200000);

alter table public.demo_sessions alter column updated_at set default now();
