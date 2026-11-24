-- M4: persist the job-specific tailoring assessment with its CV draft.
-- Existing drafts receive NULL and can be tailored again when reopened.

alter table public.cv_versions
  add column if not exists tailoring_assessment jsonb;
