-- Public Job Discovery: allow anonymous read-only access to active listings.
-- User-specific state remains private and is not granted to anon.
grant select on public.jobs to anon;
grant select on public.job_sources to anon;

-- The remote database may already contain these policies even when this
-- migration is still pending in migration history. Reconcile them safely.
drop policy if exists "Anonymous visitors can read jobs with active sources"
  on public.jobs;
drop policy if exists "Anonymous visitors can read active job sources"
  on public.job_sources;

create policy "Anonymous visitors can read jobs with active sources"
  on public.jobs
  for select
  to anon
  using (
    exists (
      select 1
        from public.job_sources s
       where s.job_id = jobs.id
         and s.availability_status = 'active'
    )
  );

create policy "Anonymous visitors can read active job sources"
  on public.job_sources
  for select
  to anon
  using (availability_status = 'active');

-- No grants or policies are added for anon on user_job_states.
