create table public.profiles (
  user_id text primary key check (char_length(user_id) between 1 and 255),
  display_name text check (display_name is null or char_length(display_name) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from public, anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can create their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id)
  with check ((select auth.jwt() ->> 'sub') = user_id);

create function public.set_profiles_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_profiles_updated_at();
