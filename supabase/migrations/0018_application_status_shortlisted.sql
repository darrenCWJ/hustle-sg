-- Add 'shortlisted' to the application status constraint and fix decide_application RPC.
-- Previously 'shortlisted' was mapped to 'interviewing' inside the RPC as a workaround.

alter table public.applications
  drop constraint applications_status_check,
  add constraint applications_status_check
  check (status in ('applied','interviewing','shortlisted','hired','rejected','withdrawn','offered'));

-- Update RPC to handle all statuses properly (no more silent mapping).
create or replace function public.decide_application(
  p_app_id    uuid,
  p_decision  text,   -- 'shortlisted' | 'offered' | 'hired' | 'rejected'
  p_actor_id  uuid
)
returns jsonb
language plpgsql security definer as $$
declare
  v_app         record;
  v_notif_kind  text;
  v_notif_title text;
  v_notif_body  text;
begin
  if p_decision not in ('shortlisted','offered','hired','rejected') then
    raise exception 'decision must be shortlisted, offered, hired, or rejected';
  end if;

  select a.*, g.employer_id, g.title as gig_title
  into   v_app
  from   public.applications a
  join   public.gigs g on g.id = a.gig_id
  where  a.id = p_app_id;

  if not found then
    raise exception 'application not found';
  end if;

  if v_app.employer_id <> p_actor_id then
    raise exception 'not authorised';
  end if;

  update public.applications set status = p_decision where id = p_app_id;

  v_notif_kind  := 'application_status_changed';
  v_notif_title := case p_decision
    when 'shortlisted' then 'You''ve been shortlisted!'
    when 'offered'     then 'You received an offer!'
    when 'hired'       then 'You got the gig!'
    when 'rejected'    then 'Application update'
  end;
  v_notif_body := case p_decision
    when 'shortlisted' then 'Great news — the employer has shortlisted you for "' || v_app.gig_title || '".'
    when 'offered'     then 'The employer has sent you a formal offer for "' || v_app.gig_title || '".'
    when 'hired'       then 'Congratulations — you''ve been hired for "' || v_app.gig_title || '".'
    when 'rejected'    then 'The employer has moved forward with other candidates for "' || v_app.gig_title || '".'
  end;

  insert into public.notifications(user_id, kind, title, body, link, data)
  values (
    v_app.applicant_id,
    v_notif_kind,
    v_notif_title,
    v_notif_body,
    '/gigs/' || v_app.gig_id,
    jsonb_build_object('application_id', p_app_id, 'status', p_decision)
  );

  return jsonb_build_object('ok', true, 'new_status', p_decision);
end;
$$;
