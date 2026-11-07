-- Store the exact Scout vacancy contract in the Thungatha job catalogue.

alter table public.jobs
  add column if not exists scout_vacancy_id uuid,
  add column if not exists company_logo_url text,
  add column if not exists application_url text,
  add column if not exists published_at timestamptz,
  add column if not exists source_updated_at timestamptz;

alter table public.jobs alter column location_text drop not null;

create unique index if not exists jobs_scout_vacancy_id_unique
  on public.jobs (scout_vacancy_id)
  where scout_vacancy_id is not null;

alter table public.jobs
  add constraint jobs_scout_vacancy_required_fields
    check (
      scout_vacancy_id is null
      or (
        char_length(trim(title)) >= 2
        and employer_name is not null
        and char_length(trim(employer_name)) >= 2
        and description is not null
        and char_length(trim(regexp_replace(description, '<[^>]*>', ' ', 'g'))) >= 20
        and application_url is not null
        and application_url ~ '^https?://'
      )
    ),
  add constraint jobs_company_logo_url_http
    check (company_logo_url is null or company_logo_url ~ '^https?://'),
  add constraint jobs_application_url_http
    check (application_url is null or application_url ~ '^https?://');

create policy "Public users can read Scout vacancies"
  on public.jobs
  for select
  to anon
  using (scout_vacancy_id is not null);

create policy "Authenticated users can read Scout vacancies"
  on public.jobs
  for select
  to authenticated
  using (
    scout_vacancy_id is not null
    and (select auth.jwt() ->> 'sub') is not null
  );

create or replace view public.job_discovery_feed
with (security_invoker = true)
as
select
  id,
  scout_vacancy_id,
  title,
  employer_name,
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
grant select on public.jobs to anon, authenticated;
