-- Allow users to dismiss an employer independently from an individual vacancy.
alter table public.jobs
  add column if not exists employer_key text
  generated always as (
    regexp_replace(lower(trim(coalesce(employer_name, ''))), '[^a-z0-9]+', '', 'g')
  ) stored;

create index if not exists jobs_employer_key_idx
  on public.jobs (employer_key)
  where employer_key <> '';

create table if not exists public.user_employer_dismissals (
  user_id text not null
    check (char_length(user_id) between 1 and 255),
  employer_key text not null
    check (char_length(employer_key) between 1 and 300),
  employer_name text not null
    check (char_length(trim(employer_name)) between 1 and 300),
  created_at timestamptz not null default now(),
  primary key (user_id, employer_key)
);

create index if not exists user_employer_dismissals_user_idx
  on public.user_employer_dismissals (user_id);

alter table public.user_employer_dismissals enable row level security;
revoke all on public.user_employer_dismissals from public, anon, authenticated;
grant select, insert, update, delete on public.user_employer_dismissals to authenticated;

create policy "Users can read their own employer dismissals"
  on public.user_employer_dismissals
  for select to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can create their own employer dismissals"
  on public.user_employer_dismissals
  for insert to authenticated
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can update their own employer dismissals"
  on public.user_employer_dismissals
  for update to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id)
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can delete their own employer dismissals"
  on public.user_employer_dismissals
  for delete to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

create or replace view public.job_discovery_feed
with (security_invoker = true)
as
select
  id,
  scout_vacancy_id,
  title,
  employer_name,
  employer_key,
  company_logo_url,
  description,
  location_text,
  application_url,
  published_at,
  source_updated_at,
  updated_at
from public.jobs
where scout_vacancy_id is not null;

grant select on public.job_discovery_feed to anon, authenticated;
