-- Extend applications_status_check to include 'offered' (direct offer from employer)
alter table public.applications
  drop constraint applications_status_check;

alter table public.applications
  add constraint applications_status_check
  check (status in ('applied','interviewing','hired','rejected','withdrawn','offered'));

-- Extend notifications_kind_check to include 'direct_offer'
alter table public.notifications
  drop constraint notifications_kind_check;

alter table public.notifications
  add constraint notifications_kind_check check (kind in (
    'application_received',
    'application_status_changed',
    'interview_submitted',
    'gig_filled',
    'cert_verified',
    'instant_gig_accepted',
    'gig_match',
    'direct_offer'
  ));
