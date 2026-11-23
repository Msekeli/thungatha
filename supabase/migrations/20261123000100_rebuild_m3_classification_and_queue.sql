-- M3 replacement: only Match and Relevant are classifications.
-- Insufficient evidence is a processing outcome, never a third classification.
delete from public.job_match_assessments
where classification = 'unclassified';

alter table public.job_match_assessments
  drop constraint if exists job_match_assessments_classification_check;
alter table public.job_match_assessments
  add constraint job_match_assessments_classification_check
  check (classification in ('match', 'relevant'));

alter table public.ai_task_queue
  drop constraint if exists ai_task_queue_status_check;
alter table public.ai_task_queue
  add constraint ai_task_queue_status_check
  check (status in ('pending', 'processing', 'completed', 'failed', 'unavailable'));

-- Enqueue every supplied task. Deduplication is handled by the unique key;
-- the database does not impose per-user depth or per-request task caps.
create or replace function public.enqueue_ai_job_assessment_tasks(
  p_user_id text,
  p_tasks jsonb
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer;
begin
  if p_tasks is null or pg_catalog.jsonb_typeof(p_tasks) <> 'array' then
    raise exception 'p_tasks must be a JSON array';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_to_recordset(p_tasks) as task(
      user_id text,
      task_type text,
      job_id uuid,
      profile_version integer,
      job_description_hash text,
      assessment_version text,
      dedupe_key text
    )
    where task.user_id is distinct from p_user_id
      or task.task_type is distinct from 'job_fit_assessment'
      or task.job_id is null
      or task.profile_version is null or task.profile_version < 1
      or task.job_description_hash is null
      or task.job_description_hash !~ '^[a-f0-9]{64}
  ) then
    raise exception 'One or more AI assessment tasks are invalid';
  end if;

  insert into public.ai_task_queue (
    dedupe_key, task_type, user_id, job_id, profile_version,
    job_description_hash, assessment_version
  )
  select task.dedupe_key, task.task_type, task.user_id, task.job_id,
    task.profile_version, task.job_description_hash, task.assessment_version
  from pg_catalog.jsonb_to_recordset(p_tasks) as task(
    dedupe_key text,
    task_type text,
    user_id text,
    job_id uuid,
    profile_version integer,
    job_description_hash text,
    assessment_version text
  )
  on conflict (dedupe_key) do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

revoke all on function public.enqueue_ai_job_assessment_tasks(text, jsonb)
  from public, anon, authenticated;
grant execute on function public.enqueue_ai_job_assessment_tasks(text, jsonb)
  to service_role;

-- A worker lease expiry always makes the task recoverable. Attempts are
-- diagnostic metadata, not a reason to abandon accepted work.
create or replace function public.claim_ai_job_matching_task()
returns setof public.ai_task_queue
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed_id uuid;
begin
  update public.ai_task_queue as q
  set status = 'pending',
      locked_at = null,
      available_at = pg_catalog.now(),
      last_error = coalesce(q.last_error, 'Worker lease expired; task recovered for retry.'),
      updated_at = pg_catalog.now()
  where q.status = 'processing'
    and q.locked_at < pg_catalog.now() - interval '10 minutes';

  select q.id into claimed_id
  from public.ai_task_queue as q
  where q.status = 'pending'
    and q.available_at <= pg_catalog.now()
  order by q.available_at, q.created_at
  for update skip locked
  limit 1;

  if claimed_id is null then return; end if;

  return query
  update public.ai_task_queue as q
  set status = 'processing',
      attempts = q.attempts + 1,
      locked_at = pg_catalog.now(),
      updated_at = pg_catalog.now()
  where q.id = claimed_id
  returning q.*;
end;
$$;

revoke all on function public.claim_ai_job_matching_task() from public, anon, authenticated;
grant execute on function public.claim_ai_job_matching_task() to service_role;

      or task.assessment_version is null or pg_catalog.btrim(task.assessment_version) = ''
      or task.dedupe_key is null or pg_catalog.btrim(task.dedupe_key) = ''
  ) then
    raise exception 'One or more AI assessment tasks are invalid';
  end if;

  insert into public.ai_task_queue (
    dedupe_key, task_type, user_id, job_id, profile_version,
    job_description_hash, assessment_version
  )
  select task.dedupe_key, task.task_type, task.user_id, task.job_id,
    task.profile_version, task.job_description_hash, task.assessment_version
  from pg_catalog.jsonb_to_recordset(p_tasks) as task(
    dedupe_key text,
    task_type text,
    user_id text,
    job_id uuid,
    profile_version integer,
    job_description_hash text,
    assessment_version text
  )
  on conflict (dedupe_key) do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

revoke all on function public.enqueue_ai_job_assessment_tasks(text, jsonb)
  from public, anon, authenticated;
grant execute on function public.enqueue_ai_job_assessment_tasks(text, jsonb)
  to service_role;

-- A worker lease expiry always makes the task recoverable. Attempts are
-- diagnostic metadata, not a reason to abandon accepted work.
create or replace function public.claim_ai_job_matching_task()
returns setof public.ai_task_queue
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed_id uuid;
begin
  update public.ai_task_queue as q
  set status = 'pending',
      locked_at = null,
      available_at = pg_catalog.now(),
      last_error = coalesce(q.last_error, 'Worker lease expired; task recovered for retry.'),
      updated_at = pg_catalog.now()
  where q.status = 'processing'
    and q.locked_at < pg_catalog.now() - interval '10 minutes';

  select q.id into claimed_id
  from public.ai_task_queue as q
  where q.status = 'pending'
    and q.available_at <= pg_catalog.now()
  order by q.available_at, q.created_at
  for update skip locked
  limit 1;

  if claimed_id is null then return; end if;

  return query
  update public.ai_task_queue as q
  set status = 'processing',
      attempts = q.attempts + 1,
      locked_at = pg_catalog.now(),
      updated_at = pg_catalog.now()
  where q.id = claimed_id
  returning q.*;
end;
$$;

revoke all on function public.claim_ai_job_matching_task() from public, anon, authenticated;
grant execute on function public.claim_ai_job_matching_task() to service_role;
