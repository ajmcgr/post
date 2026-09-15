create table public.launch_post_attributions (
  referral_id uuid primary key,
  launch_product_id uuid not null,
  source text not null check (source = 'launch'),
  campaign text not null check (campaign = 'post_launch_analytics'),
  user_id uuid references auth.users(id) on delete set null,
  arrived_at timestamptz not null default now(),
  signed_up_at timestamptz,
  social_connected_at timestamptz,
  activated_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index launch_post_attributions_user_idx
  on public.launch_post_attributions (user_id)
  where user_id is not null;

create index launch_post_attributions_arrived_idx
  on public.launch_post_attributions (arrived_at desc);

alter table public.launch_post_attributions enable row level security;
revoke all on public.launch_post_attributions from anon, authenticated;
grant insert on public.launch_post_attributions to anon, authenticated;

create policy "Anonymous Launch visitors can record an arrival"
on public.launch_post_attributions
for insert
to anon, authenticated
with check (
  user_id is null
  and source = 'launch'
  and campaign = 'post_launch_analytics'
);

create or replace function public.claim_launch_post_attribution(p_referral_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  account_created_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select created_at into account_created_at
  from auth.users
  where id = auth.uid();

  -- Only brand-new Post accounts are acquisition conversions. Existing users
  -- can use the destination, but never inflate this experiment's funnel.
  if account_created_at is null or account_created_at < now() - interval '30 minutes' then
    return false;
  end if;

  update public.launch_post_attributions
  set user_id = auth.uid(),
      signed_up_at = coalesce(signed_up_at, now()),
      updated_at = now()
  where referral_id = p_referral_id
    and user_id is null;

  return found;
end;
$$;

revoke all on function public.claim_launch_post_attribution(uuid) from public;
grant execute on function public.claim_launch_post_attribution(uuid) to authenticated;

create or replace function public.track_launch_post_connection()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.is_connected then
    update public.launch_post_attributions
    set social_connected_at = coalesce(social_connected_at, now()),
        updated_at = now()
    where user_id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger launch_post_connection_attribution
after insert or update of is_connected on public.oauth_connections
for each row execute function public.track_launch_post_connection();

create or replace function public.track_launch_post_activation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status in ('scheduled', 'posted') and exists (
    select 1 from public.oauth_connections
    where user_id = new.user_id and is_connected
  ) then
    update public.launch_post_attributions
    set activated_at = coalesce(activated_at, now()),
        updated_at = now()
    where user_id = new.user_id
      and social_connected_at is not null;
  end if;
  return new;
end;
$$;

create trigger launch_post_activation_attribution
after insert or update of status on public.posts
for each row execute function public.track_launch_post_activation();

create or replace function public.track_launch_post_paid_conversion()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.plan = 'pro' and new.status in ('trialing', 'active', 'past_due') then
    update public.launch_post_attributions
    set paid_at = coalesce(paid_at, now()),
        updated_at = now()
    where user_id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger launch_post_paid_attribution
after insert or update of plan, status on public.subscriptions
for each row execute function public.track_launch_post_paid_conversion();

create view public.launch_post_acquisition_funnel
with (security_invoker = true) as
select
  count(*) as arrivals,
  count(*) filter (where signed_up_at is not null) as signups,
  count(*) filter (where social_connected_at is not null) as social_connections,
  count(*) filter (where activated_at is not null) as activated_users,
  count(*) filter (where paid_at is not null) as paid_users
from public.launch_post_attributions
where campaign = 'post_launch_analytics';

revoke all on public.launch_post_acquisition_funnel from anon, authenticated;
