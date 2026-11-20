-- AI matching internals are accessible only to the trusted server-side worker.
alter table public.job_ai_understandings enable row level security;
grant all on table public.job_ai_understandings to service_role;
grant all on table public.ai_task_queue to service_role;
grant all on table public.job_match_assessments to service_role;
