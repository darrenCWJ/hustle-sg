-- Extra timing detail columns for richer gig scheduling
alter table public.gigs
  add column if not exists hours_required   smallint,           -- for "less than a day" gigs
  add column if not exists recurrence_cadence text,             -- for ongoing gigs: "weekly", "monthly", etc.
  add column if not exists milestones        jsonb default '[]'; -- for project-based: [{name, due_date}]
