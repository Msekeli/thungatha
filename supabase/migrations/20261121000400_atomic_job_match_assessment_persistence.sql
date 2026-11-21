-- Persist an AI assessment only while its exact inputs remain current.
-- Row locks make the freshness check, assessment upsert, and task completion atomic.
create or replace function public.persist_job_match_assessment(
  p_task_id uuid,
  p_user_id text,
  p_job_id uuid,
  p_profile_version integer,
  p_profile_confirmed_at timestamptz,
  p_job_description text,
  p_assessment_version text,
  p_classification text,
  p_assessment jsonb,
  p_provider text,
  p_model text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_task public.ai_task_queue%rowtype;
  v_description text;
  v_profile_version integer;
  v_confirmed_at timestamptz;
begin
  select q.* into v_task
  from public.ai_task_queue as q
  where q.id = p_task_id
  for update;

  if not found then
    return false;
  end if;
  if v_task.status <> 'processing' then
    return false;
  end if;

  if v_task.user_id is distinct from p_user_id
    or v_task.job_id is distinct from p_job_id
    or v_task.profile_version is distinct from p_profile_version
    or v_task.assessment_version is distinct from p_assessment_version
    or v_task.task_type <> 'job_fit_assessment'
  then
    update public.ai_task_queue
    set status = 'completed', locked_at = null, last_error = null,
        updated_at = pg_catalog.now()
    where id = p_task_id;
    return false;
  end if;

  select j.description into v_description
  from public.jobs as j
  where j.id = p_job_id
  for update;

  if not found then
    update public.ai_task_queue
    set status = 'completed', locked_at = null, last_error = null,
        updated_at = pg_catalog.now()
    where id = p_task_id;
    return false;
  end if;

  select p.profile_version, p.confirmed_at
    into v_profile_version, v_confirmed_at
  from public.profiles as p
  where p.user_id = p_user_id
  for update;

  if not found
    or v_confirmed_at is null
    or v_profile_version is distinct from p_profile_version
    or v_confirmed_at is distinct from p_profile_confirmed_at
    or v_description is distinct from p_job_description
  then
    update public.ai_task_queue
    set status = 'completed', locked_at = null, last_error = null,
        updated_at = pg_catalog.now()
    where id = p_task_id;
    return false;
  end if;

  if p_classification not in ('match', 'relevant', 'unclassified') then
    raise exception 'Invalid AI match classification';
  end if;

  insert into public.job_match_assessments (
    user_id, job_id, profile_version, job_description_hash,
    assessment_version, classification, assessment, provider, model
  ) values (
    p_user_id, p_job_id, p_profile_version, v_task.job_description_hash,
    p_assessment_version, p_classification, p_assessment, p_provider, p_model
  )
  on conflict (user_id, job_id, profile_version, job_description_hash, assessment_version)
  do update set
    classification = excluded.classification,
    assessment = excluded.assessment,
    provider = excluded.provider,
    model = excluded.model,
    created_at = pg_catalog.now();

  update public.ai_task_queue
  set status = 'completed', locked_at = null, last_error = null,
      updated_at = pg_catalog.now()
  where id = p_task_id;

  return true;
end;
$$;

revoke all on function public.persist_job_match_assessment(
  uuid, text, uuid, integer, timestamptz, text, text, text, jsonb, text, text
) from public, anon, authenticated;
grant execute on function public.persist_job_match_assessment(
  uuid, text, uuid, integer, timestamptz, text, text, text, jsonb, text, text
) to service_role;
