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


-- Serialize queue admission per user so simultaneous selected-job requests cannot
-- exceed the bounded pending/processing workload.
create or replace function public.enqueue_ai_job_assessment_tasks(
  p_user_id text,
  p_tasks jsonb,
  p_max_active integer default 3,
  p_max_to_enqueue integer default 3
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_active integer;
  v_inserted integer;
begin
  if p_user_id is null or p_user_id = '' then
    raise exception 'A user ID is required';
  end if;

  if p_max_active < 1 or p_max_to_enqueue < 1 then
    return 0;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id, 0)
  );

  select count(*)::integer into v_active
  from public.ai_task_queue
  where user_id = p_user_id
    and status in ('pending', 'processing');

  if v_active >= p_max_active then
    return 0;
  end if;

  with requested as (
    select
      task.dedupe_key,
      task.task_type,
      task.job_id,
      task.profile_version,
      task.job_description_hash,
      task.assessment_version
    from pg_catalog.jsonb_to_recordset(coalesce(p_tasks, '[]'::jsonb)) as task(
      dedupe_key text,
      task_type text,
      job_id uuid,
      profile_version integer,
      job_description_hash text,
      assessment_version text
    )
    where task.task_type = 'job_fit_assessment'
      and task.profile_version > 0
      and task.job_description_hash ~ '^[a-f0-9]{64}$'
    order by task.dedupe_key
    limit least(p_max_to_enqueue, p_max_active - v_active)
  ),
  inserted as (
    insert into public.ai_task_queue (
      dedupe_key,
      task_type,
      user_id,
      job_id,
      profile_version,
      job_description_hash,
      assessment_version
    )
    select
      requested.dedupe_key,
      requested.task_type,
      p_user_id,
      requested.job_id,
      requested.profile_version,
      requested.job_description_hash,
      requested.assessment_version
    from requested
    on conflict (dedupe_key) do nothing
    returning id
  )
  select count(*)::integer into v_inserted from inserted;

  return v_inserted;
end;
$$;

revoke all on function public.enqueue_ai_job_assessment_tasks(text, jsonb, integer, integer)
  from public, anon, authenticated;
grant execute on function public.enqueue_ai_job_assessment_tasks(text, jsonb, integer, integer)
  to service_role;

commit;
