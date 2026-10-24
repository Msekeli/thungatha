-- Allow the public job-discovery page to read only currently relevant listings.
-- The API applies the selected recency filter (up to 30 days).
-- Anonymous users must not be able to read expired, undated, or unavailable sources.

grant select on public.jobs to anon;
grant select on public.job_sources to anon;

-- Replace the broader policies from the initial public-read migration.
-- Permissive policies combine with OR, so leaving them would bypass the
-- 30-day publication window.
drop policy if exists "Anonymous visitors can read active job sources"
  on public.job_sources;
drop policy if exists "Anonymous visitors can read jobs with active sources"
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
        from public.job_sources s
       where s.job_id = jobs.id
         and s.availability_status = 'active'
         and s.published_at is not null
         and s.published_at >= now() - interval '30 days'
    )
  );
