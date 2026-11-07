-- Add explicit country and versioned snapshots to the existing M2 profile contract.
-- Existing profile rows and the earlier M2 columns are preserved.

alter table public.profiles
  add column if not exists country text check (country is null or char_length(country) <= 100),
  add column if not exists profile_version integer not null default 1 check (profile_version > 0);

create table if not exists public.profile_versions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(user_id) on delete cascade,
  version integer not null check (version > 0),
  profile_snapshot jsonb not null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, version)
);

alter table public.profile_versions enable row level security;
revoke all on table public.profile_versions from public, anon, authenticated;
grant select on table public.profile_versions to authenticated;
drop policy if exists "Users can read their own profile versions" on public.profile_versions;
create policy "Users can read their own profile versions"
  on public.profile_versions for select to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

-- Preserve the current profile as the initial version before enabling the trigger.
insert into public.profile_versions (user_id, version, profile_snapshot, confirmed_at)
select user_id, profile_version, pg_catalog.jsonb_build_object(
  'displayName', display_name,
  'personalDetails', pg_catalog.jsonb_build_object(
    'fullName', full_name, 'email', email, 'phone', phone,
    'location', location, 'country', country,
    'linkedinUrl', linkedin_url, 'portfolioUrl', portfolio_url
  ),
  'summary', summary, 'workExperience', experience, 'education', education,
  'skills', skills, 'certifications', certifications, 'projects', projects,
  'masterCv', master_cv, 'confirmedAt', confirmed_at
), confirmed_at
from public.profiles
on conflict (user_id, version) do nothing;

create or replace function public.set_profile_version()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    new.profile_version := old.profile_version + 1;
  else
    new.profile_version := 1;
  end if;
  return new;
end;
$$;

create or replace function public.snapshot_profile_version()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profile_versions (user_id, version, profile_snapshot, confirmed_at)
  values (new.user_id, new.profile_version, pg_catalog.jsonb_build_object(
    'displayName', new.display_name,
    'personalDetails', pg_catalog.jsonb_build_object(
      'fullName', new.full_name, 'email', new.email, 'phone', new.phone,
      'location', new.location, 'country', new.country,
      'linkedinUrl', new.linkedin_url, 'portfolioUrl', new.portfolio_url
    ),
    'summary', new.summary, 'workExperience', new.experience, 'education', new.education,
    'skills', new.skills, 'certifications', new.certifications, 'projects', new.projects,
    'masterCv', new.master_cv, 'confirmedAt', new.confirmed_at
  ), new.confirmed_at)
  on conflict (user_id, version) do update
    set profile_snapshot = excluded.profile_snapshot, confirmed_at = excluded.confirmed_at;
  return new;
end;
$$;

revoke all on function public.set_profile_version() from public, anon, authenticated;
revoke all on function public.snapshot_profile_version() from public, anon, authenticated;
drop trigger if exists profiles_set_version on public.profiles;
create trigger profiles_set_version before insert or update on public.profiles
  for each row execute function public.set_profile_version();
drop trigger if exists profiles_snapshot_version on public.profiles;
create trigger profiles_snapshot_version after insert or update on public.profiles
  for each row execute function public.snapshot_profile_version();
