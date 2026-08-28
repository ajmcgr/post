create or replace function public.create_default_workspace_for_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  workspace_id uuid;
begin
  insert into public.workspaces (name, owner_id)
  values ('main', new.id)
  returning id into workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (workspace_id, new.id, 'owner');
  return new;
end;
$$;

drop trigger if exists create_default_workspace_after_signup on auth.users;
create trigger create_default_workspace_after_signup
  after insert on auth.users
  for each row execute function public.create_default_workspace_for_user();

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id and user_id = auth.uid()
  );
$$;

create or replace function public.can_manage_workspace(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

drop policy if exists "Users can read workspace memberships" on public.workspace_members;
drop policy if exists "Workspace members can read memberships" on public.workspace_members;
create policy "Workspace members can read memberships"
  on public.workspace_members for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Owners and admins can manage members" on public.workspace_members;
drop policy if exists "Owners and admins can add members" on public.workspace_members;
create policy "Owners and admins can add members"
  on public.workspace_members for insert
  with check (user_id = auth.uid() or public.can_manage_workspace(workspace_id));

drop policy if exists "Owners and admins can update members" on public.workspace_members;
create policy "Owners and admins can update members"
  on public.workspace_members for update
  using (public.can_manage_workspace(workspace_id))
  with check (public.can_manage_workspace(workspace_id));

drop policy if exists "Owners and admins can remove members" on public.workspace_members;
create policy "Owners and admins can remove members"
  on public.workspace_members for delete
  using (user_id = auth.uid() or public.can_manage_workspace(workspace_id));
