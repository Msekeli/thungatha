-- M3-C02: persist deterministic extraction and source freshness metadata.
alter table public.jobs
  add column if not exists extracted_requirements jsonb,
  add column if not exists requirements_description_hash text,
  add column if not exists requirements_extraction_version text,
  add column if not exists requirements_extraction_status text;

alter table public.jobs
  add constraint jobs_requirements_hash_format
    check (
      requirements_description_hash is null
      or requirements_description_hash ~ '^[a-f0-9]{64}$'
    ),
  add constraint jobs_requirements_extraction_status
    check (
      requirements_extraction_status is null
      or requirements_extraction_status in ('complete', 'partial', 'unavailable')
    );

comment on column public.jobs.extracted_requirements is
  'Rules-only M3 job requirement extraction. Source snippets and schema version are retained in JSONB.';
comment on column public.jobs.requirements_description_hash is
  'SHA-256 of the exact source description used for the current extraction.';
