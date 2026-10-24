-- Give the job feed a parent-level publication timestamp so ordering happens
-- before pagination. Ordering an embedded job_sources relation only sorts the
-- nested source rows, not the parent jobs.
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
) as source
where exists (
  select 1
  from public.job_sources as s
  where s.job_id = j.id
    and s.availability_status = 'active'
);

grant select on public.job_discovery_feed to anon, authenticated;
