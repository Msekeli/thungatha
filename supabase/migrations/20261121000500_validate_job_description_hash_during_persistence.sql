-- Bind the locked queue task to the exact description hash used by the worker.
-- The legacy persistence function remains private and is called only after this guard.
create or replace function public.persist_job_match_assessment(
  p_task_id uuid,
  p_user_id text,
  p_job_id uuid,
  p_profile_version integer,
  p_profile_confirmed_at timestamptz,
  p_job_description_hash text,
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
begin
  select q.* into v_task
  from public.ai_task_queue as q
  where q.id = p_task_id
  for update;

  if not found or v_task.status <> 'processing' then
    return false;
  end if;

  if v_task.job_description_hash is distinct from p_job_description_hash then
    update public.ai_task_queue
    set status = 'completed', locked_at = null, last_error = null,
        updated_at = pg_catalog.now()
    where id = p_task_id;
    return false;
  end if;

  return public.persist_job_match_assessment(
    p_task_id, p_user_id, p_job_id, p_profile_version,
    p_profile_confirmed_at, p_job_description, p_assessment_version,
    p_classification, p_assessment, p_provider, p_model
  );
end;
$$;

revoke all on function public.persist_job_match_assessment(
  uuid, text, uuid, integer, timestamptz, text, text, text, text, jsonb, text, text
) from public, anon, authenticated;
revoke all on function public.persist_job_match_assessment(
  uuid, text, uuid, integer, timestamptz, text, text, text, jsonb, text, text
) from public, anon, authenticated, service_role;
grant execute on function public.persist_job_match_assessment(
  uuid, text, uuid, integer, timestamptz, text, text, text, text, jsonb, text, text
) to service_role;
