-- Add headcount field to gigs (how many freelancers are needed)
alter table gigs add column headcount integer not null default 1;
alter table gigs add constraint gigs_headcount_range check (headcount >= 1 and headcount <= 50);
