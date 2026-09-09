create or replace function public.enforce_media_publishing_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(jsonb_array_length(new.media), 0) = 0 then
    return new;
  end if;

  if public.current_plan_for_user(new.user_id) not in ('pro', 'business') then
    raise exception 'Image and video publishing requires the Pro plan.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_media_publishing_plan() from public, anon, authenticated;

drop trigger if exists enforce_media_publishing_plan_trigger on public.posts;
create trigger enforce_media_publishing_plan_trigger
  before insert or update of media on public.posts
  for each row execute function public.enforce_media_publishing_plan();
