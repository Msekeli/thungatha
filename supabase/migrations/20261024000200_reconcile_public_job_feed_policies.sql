-- Reconcile public Job Discovery access after the feed-view migration.
-- PostgreSQL permissive policies are OR-combined, so leave one explicit
-- anonymous policy per table and keep the same 30-day eligibility rule.
-- This migration is intentionally idempotent and does not modify job data.

grant select on public.jobs to anon, authenticated;
grant select on public.job_sources to anon, authenticated;

drop policy if exists "Anonymous visitors can read active job sources"
  on public.job_sources;
drop policy if exists "Anonymous visitors can read jobs with active sources"
  on public.jobs;
drop policy if exists "Anonymous users can read recent active job sources"
  on public.job_sources;
drop policy if exists "Anonymous users can read jobs with recent active sources"
  on public.jobs;

create policy "Anonymous users can read recent active job sources"
  on public.job_sources
  for select
  to anon
  using (
    availability_status = 'active'
    and published_at is not null
    and published_at >= now() - interval '30 days'
  );

create policy "Anonymous users can read jobs with recent active sources"
  on public.jobs
  for select
  to anon
  using (
    exists (
      select 1
      from public.job_sources as s
      where s.job_id = jobs.id
        and s.availability_status = 'active'
        and s.published_at is not null
        and s.published_at >= now() - interval '30 days'
    )
  );

create index if not exists job_sources_active_job_published_idx
  on public.job_sources (job_id, published_at desc)
  where availability_status = 'active';

create or replace view public.job_discovery_feed
with (security_invoker = true)
as
select
  j.id,
  j.title,
  j.employer_name,
  j.description,
  j.location_text,
  j.country_code,
  j.work_mode,
  j.employment_type,
  j.salary_min,
  j.salary_max,
  j.salary_currency,
  j.updated_at,
  source.published_at
from public.jobs as j
cross join lateral (
  select max(s.published_at) as published_at
  from public.job_sources as s
  where s.job_id = j.id
    and s.availability_status = 'active'
    and s.published_at is not null
    and s.published_at >= now() - interval '30 days'
) as source
where exists (
  select 1
  from public.job_sources as s
  where s.job_id = j.id
    and s.availability_status = 'active'
    and s.published_at is not null
    and s.published_at >= now() - interval '30 days'
);

grant select on public.job_discovery_feed to anon, authenticated;
