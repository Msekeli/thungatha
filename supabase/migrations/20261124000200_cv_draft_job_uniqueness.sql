-- M4: enforce one active tailored draft per candidate, Profile version and job.
-- This protects draft creation from concurrent requests and React re-mounts.

do $$
begin
  if exists (
    select 1
    from public.cv_versions
    where cv_kind = 'tailored'
      and status = 'draft'
    group by
      user_id,
      source_profile_version,
      coalesce(
        source_job_id::text,
        source_job_snapshot ->> 'jobId',
        source_job_snapshot ->> 'descriptionFingerprint'
      )
    having count(*) > 1
  ) then
    raise exception
      'Duplicate tailored drafts exist for the same Profile version and job. Resolve duplicates before applying this migration.';
  end if;
end;
$$;

create unique index cv_versions_one_draft_per_user_profile_job_idx
  on public.cv_versions (
    user_id,
    source_profile_version,
    (
      coalesce(
        source_job_id::text,
        source_job_snapshot ->> 'jobId',
        source_job_snapshot ->> 'descriptionFingerprint'
      )
    )
  )
  where cv_kind = 'tailored' and status = 'draft';
