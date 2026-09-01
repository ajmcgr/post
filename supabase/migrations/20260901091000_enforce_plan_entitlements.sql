create or replace function public.current_plan_for_user(target_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select plan
    from public.subscriptions
    where user_id = target_user_id
      and status in ('active', 'trialing', 'past_due')
    limit 1
  ), 'free');
$$;

revoke all on function public.current_plan_for_user(uuid) from public, anon, authenticated;

create or replace function public.enforce_social_account_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  active_plan text;
  account_limit integer;
  connected_count integer;
begin
  if new.is_connected is not true then
    return new;
  end if;

  active_plan := public.current_plan_for_user(new.user_id);
  account_limit := case active_plan
    when 'free' then 2
    when 'pro' then 7
    else null
  end;

  if account_limit is null then
    return new;
  end if;

  select count(*)
  into connected_count
  from public.oauth_connections
  where user_id = new.user_id
    and is_connected = true
    and platform is distinct from new.platform;

  if connected_count >= account_limit then
    raise exception 'Your % plan supports up to % connected social platforms.', active_plan, account_limit
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_social_account_limit_trigger on public.oauth_connections;
create trigger enforce_social_account_limit_trigger
  before insert or update of is_connected, platform on public.oauth_connections
  for each row execute function public.enforce_social_account_limit();

create or replace function public.enforce_scheduled_post_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  active_plan text;
  scheduled_count integer;
begin
  if new.scheduled_at is null then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.scheduled_at is not null then
      return new;
    end if;
  end if;

  active_plan := public.current_plan_for_user(new.user_id);
  if active_plan <> 'free' then
    return new;
  end if;

  select count(*)
  into scheduled_count
  from public.posts
  where user_id = new.user_id
    and scheduled_at is not null
    and created_at >= date_trunc('month', now())
    and created_at < date_trunc('month', now()) + interval '1 month';

  if scheduled_count >= 10 then
    raise exception 'Your Free plan supports up to 10 scheduled posts per month.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_scheduled_post_limit_trigger on public.posts;
create trigger enforce_scheduled_post_limit_trigger
  before insert or update of scheduled_at on public.posts
  for each row execute function public.enforce_scheduled_post_limit();

create or replace function public.enforce_workspace_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  active_plan text;
  workspace_count integer;
begin
  active_plan := public.current_plan_for_user(new.owner_id);
  if active_plan = 'business' then
    return new;
  end if;

  select count(*)
  into workspace_count
  from public.workspaces
  where owner_id = new.owner_id;

  if workspace_count >= 1 then
    raise exception 'Multiple workspaces require the Business plan.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_workspace_limit_trigger on public.workspaces;
create trigger enforce_workspace_limit_trigger
  before insert on public.workspaces
  for each row execute function public.enforce_workspace_limit();

create or replace function public.enforce_team_invitation_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_plan_for_user(new.invited_by) <> 'business' then
    raise exception 'Team invitations require the Business plan.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_team_invitation_plan_trigger on public.workspace_invitations;
create trigger enforce_team_invitation_plan_trigger
  before insert on public.workspace_invitations
  for each row execute function public.enforce_team_invitation_plan();
