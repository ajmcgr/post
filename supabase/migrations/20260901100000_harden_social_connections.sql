create table if not exists public.oauth_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('linkedin', 'instagram', 'facebook', 'youtube', 'threads', 'tiktok')),
  state_hash text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists oauth_states_expiry_idx
  on public.oauth_states (expires_at)
  where consumed_at is null;

alter table public.oauth_states enable row level security;

revoke all privileges on table public.oauth_states from anon, authenticated;
grant select, insert, update, delete on table public.oauth_states to service_role;

create or replace function public.consume_oauth_state(
  target_user_id uuid,
  target_platform text,
  target_state_hash text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_rows integer;
begin
  update public.oauth_states
  set consumed_at = now()
  where user_id = target_user_id
    and platform = target_platform
    and state_hash = target_state_hash
    and consumed_at is null
    and expires_at > now();

  get diagnostics affected_rows = row_count;
  return affected_rows = 1;
end;
$$;

revoke all on function public.consume_oauth_state(uuid, text, text) from public, anon, authenticated;
grant execute on function public.consume_oauth_state(uuid, text, text) to service_role;

-- The browser no longer reads or mutates this token-bearing table directly.
-- Authenticated access is provided only through sanitized Edge Functions.
revoke all privileges on table public.oauth_connections from anon, authenticated;

select pg_notify('pgrst', 'reload schema');
