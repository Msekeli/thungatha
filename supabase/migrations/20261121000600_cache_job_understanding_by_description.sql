-- Reuse job understanding across jobs and users that share the exact description.
-- Keep one row for each description hash and understanding schema/prompt version.
begin;

with ranked as (
  select
    ctid,
    row_number() over (
      partition by description_hash, analysis_version
      order by updated_at desc, created_at desc
    ) as duplicate_rank
  from public.job_ai_understandings
)
delete from public.job_ai_understandings as existing
using ranked
where existing.ctid = ranked.ctid
  and ranked.duplicate_rank > 1;

alter table public.job_ai_understandings
  drop constraint if exists job_ai_understandings_job_id_fkey;

alter table public.job_ai_understandings
  drop constraint if exists job_ai_understandings_pkey;

alter table public.job_ai_understandings
  drop column if exists job_id;

alter table public.job_ai_understandings
  add constraint job_ai_understandings_pkey
  primary key (description_hash, analysis_version);

comment on table public.job_ai_understandings is
  'Shared AI understanding cache keyed by exact job description SHA-256 and analysis version; not owned by a job or user.';

commit;
