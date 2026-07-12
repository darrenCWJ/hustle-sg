-- Security fix (IMPROVEMENT_PLAN.md Phase 0.2 / finding C3):
-- decide_application and accept_instant_gig were SECURITY DEFINER functions that
-- trusted a CLIENT-SUPPLIED actor/user id instead of the authenticated session.
-- Because SECURITY DEFINER bypasses RLS and the functions are exposed via
-- PostgREST to any holder of the anon key, a caller could pass someone else's id
-- to hire/reject applicants on gigs they don't own, or force-"hire" any user for
-- any instant gig — an IDOR / privilege-escalation hole.
--
-- Fix: derive identity from auth.uid() inside the function body, drop the
-- client-supplied id parameters entirely, and restrict EXECUTE to authenticated
-- roles (revoke from anon).

-- Signature change requires dropping the old functions first.
drop function if exists public.decide_application(uuid, text, uuid);
drop function if exists public.accept_instant_gig(uuid, uuid);

-- =========================================================================
-- RPC: decide_application — employer decides an applicant's status.
-- Identity comes from auth.uid(); ownership is enforced against it.
-- =========================================================================
create or replace function public.decide_application(
  p_app_id   uuid,
  p_decision text   -- 'shortlisted' | 'offered' | 'hired' | 'rejected'
)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_app         record;
  v_actor       uuid := auth.uid();
  v_notif_title text;
  v_notif_body  text;
begin
  if v_actor is null then
    raise exception 'not authenticated';
  end if;

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

  -- Ownership is checked against the SESSION identity, not a passed argument.
  if v_app.employer_id <> v_actor then
    raise exception 'not authorised';
  end if;

  update public.applications set status = p_decision where id = p_app_id;

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
    'application_status_changed',
    v_notif_title,
    v_notif_body,
    '/gigs/' || v_app.gig_id,
    jsonb_build_object('application_id', p_app_id, 'status', p_decision)
  );

  return jsonb_build_object('ok', true, 'new_status', p_decision);
end;
$$;

-- =========================================================================
-- RPC: accept_instant_gig — freelancer accepts an instant gig.
-- The applicant is auth.uid(); no user id is accepted from the client.
-- =========================================================================
create or replace function public.accept_instant_gig(
  p_gig_id uuid
)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_gig    record;
  v_user   uuid := auth.uid();
  v_app_id uuid;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  select id, title, employer_id, status into v_gig
  from   public.gigs
  where  id = p_gig_id and is_instant = true;

  if not found then
    raise exception 'instant gig not found';
  end if;

  if v_gig.status <> 'open' then
    raise exception 'gig is no longer available';
  end if;

  insert into public.applications (gig_id, applicant_id, status)
  values (p_gig_id, v_user, 'hired')
  on conflict (gig_id, applicant_id)
  do update set status = 'hired'
  returning id into v_app_id;

  insert into public.notifications (user_id, kind, title, body, link, data)
  values (
    v_gig.employer_id,
    'instant_gig_accepted',
    'Instant gig accepted',
    'Someone accepted your instant gig "' || v_gig.title || '".',
    '/gigs/' || p_gig_id,
    jsonb_build_object('gig_id', p_gig_id, 'applicant_id', v_user)
  );

  return jsonb_build_object('ok', true, 'application_id', v_app_id);
end;
$$;

-- Lock down execution: never callable by anonymous clients.
revoke all on function public.decide_application(uuid, text) from public, anon;
revoke all on function public.accept_instant_gig(uuid) from public, anon;
grant execute on function public.decide_application(uuid, text) to authenticated;
grant execute on function public.accept_instant_gig(uuid) to authenticated;
