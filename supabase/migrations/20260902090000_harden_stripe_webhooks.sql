alter table public.subscriptions
  add column if not exists stripe_event_created_at timestamptz;

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  event_created_at timestamptz not null,
  subscription_id text,
  user_id uuid references auth.users(id) on delete set null,
  processing_result text not null check (processing_result in ('applied', 'stale')),
  processed_at timestamptz not null default now()
);

create index if not exists stripe_webhook_events_subscription_idx
  on public.stripe_webhook_events(subscription_id);

alter table public.stripe_webhook_events enable row level security;

revoke all on table public.stripe_webhook_events from anon, authenticated;
grant select, insert on table public.stripe_webhook_events to service_role;

create or replace function public.apply_stripe_subscription_event(
  target_user_id uuid,
  target_customer_id text,
  target_subscription_id text,
  target_price_id text,
  target_plan text,
  target_status text,
  target_current_period_end timestamptz,
  target_cancel_at_period_end boolean,
  target_event_created_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_rows integer;
begin
  insert into public.subscriptions (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_price_id,
    plan,
    status,
    current_period_end,
    cancel_at_period_end,
    stripe_event_created_at,
    updated_at
  ) values (
    target_user_id,
    target_customer_id,
    target_subscription_id,
    target_price_id,
    target_plan,
    target_status,
    target_current_period_end,
    target_cancel_at_period_end,
    target_event_created_at,
    now()
  )
  on conflict (user_id) do update set
    stripe_customer_id = excluded.stripe_customer_id,
    stripe_subscription_id = excluded.stripe_subscription_id,
    stripe_price_id = excluded.stripe_price_id,
    plan = excluded.plan,
    status = excluded.status,
    current_period_end = excluded.current_period_end,
    cancel_at_period_end = excluded.cancel_at_period_end,
    stripe_event_created_at = excluded.stripe_event_created_at,
    updated_at = now()
  where public.subscriptions.stripe_event_created_at is null
    or excluded.stripe_event_created_at >= public.subscriptions.stripe_event_created_at;

  get diagnostics affected_rows = row_count;
  return affected_rows > 0;
end;
$$;

revoke all on function public.apply_stripe_subscription_event(
  uuid, text, text, text, text, text, timestamptz, boolean, timestamptz
) from public, anon, authenticated;
grant execute on function public.apply_stripe_subscription_event(
  uuid, text, text, text, text, text, timestamptz, boolean, timestamptz
) to service_role;
