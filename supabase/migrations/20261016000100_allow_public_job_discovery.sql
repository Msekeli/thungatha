-- Public job discovery: anonymous visitors may read the shared catalogue.
-- Personal user_job_states remains authenticated-only and is not exposed here.
grant select on public.jobs to anon;
grant select on public.job_sources to anon;

create policy "Anyone can read jobs for discovery"
  on public.jobs
  for select
  to anon
  using (true);

create policy "Anyone can read job sources for discovery"
  on public.job_sources
  for select
  to anon
  using (true);
