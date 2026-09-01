create or replace function public.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspaces
    where id = target_workspace_id
      and owner_id = auth.uid()
  );
$$;

drop policy if exists "Owners and admins can add members" on public.workspace_members;
create policy "Owners and admins can add members"
  on public.workspace_members for insert
  with check (
    public.can_manage_workspace(workspace_id)
    or (
      user_id = auth.uid()
      and role = 'owner'
      and public.is_workspace_owner(workspace_id)
    )
  );
