-- Retire the previous provider-driven job ingestion model.
-- Keep existing jobs and user activity rows; the next migration adds the Scout catalogue.

-- These policies reference job_sources, so remove them before dropping that table.
drop policy if exists "Anonymous users can read jobs with recent active sources"
  on public.jobs;
drop policy if exists "Anonymous visitors can read jobs with active sources"
  on public.jobs;
drop policy if exists "Authenticated users can read jobs"
  on public.jobs;

drop view if exists public.job_discovery_feed;

drop function if exists public.start_job_ingestion_run(text, text);
drop function if exists public.persist_job_ingestion_batch(uuid, jsonb);
drop function if exists public.finish_job_ingestion_run(uuid, text, integer, text, integer);

drop table if exists public.job_ingestion_runs;
drop table if exists public.job_sources;

alter table public.jobs
  drop column if exists country_code,
  drop column if exists work_mode,
  drop column if exists employment_type,
  drop column if exists salary_min,
  drop column if exists salary_max,
  drop column if exists salary_currency;
