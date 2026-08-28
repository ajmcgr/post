create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  connection_success boolean not null default true,
  post_failed boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

drop policy if exists "Users can manage their notification preferences" on public.notification_preferences;
create policy "Users can manage their notification preferences"
  on public.notification_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
