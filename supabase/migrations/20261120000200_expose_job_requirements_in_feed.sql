-- Expose deterministic M3 extraction metadata to the feed reader.
-- This migration changes the view definition only; it does not backfill jobs.
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
  updated_at,
  extracted_requirements,
  requirements_description_hash,
  requirements_extraction_version,
  requirements_extraction_status
from public.jobs
where scout_vacancy_id is not null;

grant select on public.job_discovery_feed to anon, authenticated;
