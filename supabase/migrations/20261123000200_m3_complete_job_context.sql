-- M3 rebuild: understanding and assessment identity includes the complete job context.
-- Existing outputs are invalid under the new contract and are deliberately invalidated.
delete from public.job_match_assessments;
delete from public.ai_task_queue;
delete from public.job_ai_understandings;

-- The understanding cache is reusable across jobs with identical complete context.
alter table public.job_ai_understandings
  drop constraint if exists job_ai_understandings_pkey;
alter table public.job_ai_understandings
  drop column if exists job_id;
alter table public.job_ai_understandings
  rename column description_hash to context_hash;
alter table public.job_ai_understandings
  add constraint job_ai_understandings_pkey
  primary key (context_hash, analysis_version);

-- Queue tasks are keyed by both raw description integrity and full job context.
alter table public.ai_task_queue
  add column if not exists job_context_hash text;
alter table public.ai_task_queue
  alter column job_context_hash set not null;
alter table public.ai_task_queue
  add constraint ai_task_queue_context_hash_format
  check (job_context_hash ~ '^[a-f0-9]{64}$');

alter table public.job_match_assessments
  add column if not exists job_context_hash text;
alter table public.job_match_assessments
  alter column job_context_hash set not null;

-- Replace legacy uniqueness with complete-context assessment identity.
do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_catalog.pg_constraint
    where conrelid = 'public.job_match_assessments'::regclass
      and contype = 'u'
  loop
    execute pg_catalog.format(
      'alter table public.job_match_assessments drop constraint %I',
      constraint_name
    );
  end loop;
  -- Remove standalone legacy unique indexes too; otherwise an old narrower
  -- identity can still block a second assessment for a changed job context.
  for constraint_name in
    select idx.relname
    from pg_catalog.pg_index as i
    join pg_catalog.pg_class as idx on idx.oid = i.indexrelid
    where i.indrelid = 'public.job_match_assessments'::regclass
      and i.indisunique
      and not exists (
        select 1
        from pg_catalog.pg_constraint as con
        where con.conindid = i.indexrelid
      )
  loop
    execute pg_catalog.format('drop index public.%I', constraint_name);
  end loop;
end;
$$;

create unique index job_match_assessments_context_unique
  on public.job_match_assessments (
    user_id, job_id, profile_version, job_context_hash, assessment_version
  );

-- Queue admission validates every identity field and only deduplicates.
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
      job_context_hash text,
      assessment_version text,
      dedupe_key text
    )
    where task.user_id is distinct from p_user_id
      or task.task_type is distinct from 'job_fit_assessment'
      or task.job_id is null
      or task.profile_version is null
      or task.profile_version < 1
      or task.job_description_hash is null
      or task.job_description_hash !~ '^[a-f0-9]{64}$'
      or task.job_context_hash is null
      or task.job_context_hash !~ '^[a-f0-9]{64}$'
      or task.assessment_version is null
      or pg_catalog.btrim(task.assessment_version) = ''
      or task.dedupe_key is null
      or pg_catalog.btrim(task.dedupe_key) = ''
  ) then
    raise exception 'One or more AI assessment tasks are invalid';
  end if;

  insert into public.ai_task_queue (
    dedupe_key, task_type, user_id, job_id, profile_version,
    job_description_hash, job_context_hash, assessment_version
  )
  select
    task.dedupe_key, task.task_type, task.user_id, task.job_id,
    task.profile_version, task.job_description_hash, task.job_context_hash,
    task.assessment_version
  from pg_catalog.jsonb_to_recordset(p_tasks) as task(
    dedupe_key text,
    task_type text,
    user_id text,
    job_id uuid,
    profile_version integer,
    job_description_hash text,
    job_context_hash text,
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

-- Extend the atomic freshness check to every field used by the model.
do $$
declare
  function_identity text;
begin
  for function_identity in
    select pg_catalog.pg_get_function_identity_arguments(p.oid)
    from pg_catalog.pg_proc as p
    join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'persist_job_match_assessment'
  loop
    execute 'drop function public.persist_job_match_assessment('
      || function_identity || ')';
  end loop;
end;
$$;

create or replace function public.persist_job_match_assessment(
  p_task_id uuid,
  p_user_id text,
  p_job_id uuid,
  p_profile_version integer,
  p_profile_confirmed_at timestamptz,
  p_job_description text,
  p_job_context_hash text,
  p_job_context jsonb,
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
  v_job public.jobs%rowtype;
  v_profile_version integer;
  v_confirmed_at timestamptz;
begin
  select q.* into v_task
  from public.ai_task_queue as q
  where q.id = p_task_id
  for update;

  if not found or v_task.status <> 'processing' then
    return false;
  end if;

  if v_task.user_id is distinct from p_user_id
    or v_task.job_id is distinct from p_job_id
    or v_task.profile_version is distinct from p_profile_version
    or v_task.job_context_hash is distinct from p_job_context_hash
    or v_task.assessment_version is distinct from p_assessment_version
    or v_task.task_type is distinct from 'job_fit_assessment'
  then
    update public.ai_task_queue
    set status = 'completed', locked_at = null, last_error = null,
        updated_at = pg_catalog.now()
    where id = p_task_id;
    return false;
  end if;

  select j.* into v_job
  from public.jobs as j
  where j.id = p_job_id
  for update;

  if not found
    or v_job.title is distinct from (p_job_context ->> 'title')
    or v_job.employer_name is distinct from (p_job_context ->> 'employerName')
    or v_job.location_text is distinct from (p_job_context ->> 'locationText')
    or v_job.description is distinct from p_job_description
  then
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
  then
    update public.ai_task_queue
    set status = 'completed', locked_at = null, last_error = null,
        updated_at = pg_catalog.now()
    where id = p_task_id;
    return false;
  end if;

  if p_classification is null
    or p_classification not in ('match', 'relevant') then
    raise exception 'Invalid M3 match classification';
  end if;

  insert into public.job_match_assessments (
    user_id, job_id, profile_version, job_description_hash,
    job_context_hash, assessment_version, classification, assessment,
    provider, model
  ) values (
    p_user_id, p_job_id, p_profile_version, v_task.job_description_hash,
    v_task.job_context_hash, p_assessment_version, p_classification,
    p_assessment, p_provider, p_model
  )
  on conflict (
    user_id, job_id, profile_version, job_context_hash, assessment_version
  )
  do update set
    job_description_hash = excluded.job_description_hash,
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
  uuid, text, uuid, integer, timestamptz, text, text, jsonb,
  text, text, jsonb, text, text
) from public, anon, authenticated;
grant execute on function public.persist_job_match_assessment(
  uuid, text, uuid, integer, timestamptz, text, text, jsonb,
  text, text, jsonb, text, text
) to service_role;
