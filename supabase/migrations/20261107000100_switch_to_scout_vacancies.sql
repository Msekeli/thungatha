-- Replace provider-driven job ingestion with the Scout vacancy contract.
-- Existing user state and application activity remain attached to public.jobs.

drop view if exists public.job_discovery_feed;

drop function if exists public.start_job_ingestion_run(text, text);
drop function if exists public.persist_job_ingestion_batch(uuid, jsonb);
drop function if exists public.finish_job_ingestion_run(uuid, text, integer, text, integer);

drop table if exists public.job_ingestion_runs;
drop table if exists public.job_sources;

alter table public.jobs
  add column if not exists scout_vacancy_id uuid,
  add column if not exists company_logo_url text,
  add column if not exists application_url text,
  add column if not exists published_at timestamptz,
  add column if not exists source_updated_at timestamptz;

create unique index if not exists jobs_scout_vacancy_id_unique
  on public.jobs (scout_vacancy_id)
  where scout_vacancy_id is not null;

alter table public.jobs
  drop constraint if exists jobs_scout_vacancy_required_fields,
  add constraint jobs_scout_vacancy_required_fields
    check (
      scout_vacancy_id is null
      or (
        char_length(trim(title)) >= 2
        and employer_name is not null
        and char_length(trim(employer_name)) >= 2
        and location_text is not null
        and char_length(trim(location_text)) >= 2
        and description is not null
        and char_length(trim(regexp_replace(description, '<[^>]*>', ' ', 'g'))) >= 20
        and application_url is not null
        and application_url ~ '^https?://'
      )
    ),
  drop constraint if exists jobs_company_logo_url_http,
  add constraint jobs_company_logo_url_http
    check (
      company_logo_url is null
      or company_logo_url ~ '^https?://'
    ),
  drop constraint if exists jobs_application_url_http,
  add constraint jobs_application_url_http
    check (
      application_url is null
      or application_url ~ '^https?://'
    );

-- Legacy catalogue rows have no Scout ID and are intentionally excluded from
-- the new feed. Their user state/activity is retained rather than discarded.
alter table public.jobs
  drop column if exists country_code,
  drop column if exists work_mode,
  drop column if exists employment_type,
  drop column if exists salary_min,
  drop column if exists salary_max,
  drop column if exists salary_currency;

drop policy if exists "Anonymous users can read jobs with recent active sources"
  on public.jobs;
drop policy if exists "Anonymous visitors can read jobs with active sources"
  on public.jobs;
drop policy if exists "Anonymous users can read jobs with recent active sources"
  on public.jobs;

create policy "Public users can read Scout vacancies"
  on public.jobs
  for select
  to anon
  using (scout_vacancy_id is not null);

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
