-- Enable pgvector and add embedding columns for AI role matching.
create extension if not exists vector;

alter table public.profiles add column if not exists embedding vector(1536);
alter table public.gigs add column if not exists embedding vector(1536);

-- IVFFlat is fine for MVP seed sizes. For > 1M rows consider HNSW.
create index if not exists profiles_embedding_idx
  on public.profiles using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists gigs_embedding_idx
  on public.gigs using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Match helpers as RPCs so RLS applies and we avoid leaking vector params.

create or replace function public.match_gigs_for_user(
  p_user_id uuid,
  p_limit int default 20
)
returns table (
  gig_id uuid,
  title text,
  description text,
  employer_id uuid,
  skills_required text[],
  budget_cents integer,
  score float
)
language sql stable as $$
  select g.id, g.title, g.description, g.employer_id,
         g.skills_required, g.budget_cents,
         1 - (g.embedding <=> p.embedding) as score
  from public.gigs g
  join public.profiles p on p.id = p_user_id
  where g.status = 'open'
    and g.embedding is not null
    and p.embedding is not null
  order by g.embedding <=> p.embedding
  limit p_limit
$$;

create or replace function public.match_users_for_gig(
  p_gig_id uuid,
  p_limit int default 20
)
returns table (
  user_id uuid,
  handle text,
  display_name text,
  headline text,
  score float
)
language sql stable as $$
  select p.id, p.handle, p.display_name, p.headline,
         1 - (p.embedding <=> g.embedding) as score
  from public.profiles p
  join public.gigs g on g.id = p_gig_id
  where p.embedding is not null
    and g.embedding is not null
    and p.role in ('freelancer','both')
  order by p.embedding <=> g.embedding
  limit p_limit
$$;
