-- Allow a worker invocation to claim only explicitly selected jobs.
-- A NULL job ID array preserves the scheduled worker's existing all-queue behavior.
drop function if exists public.claim_ai_job_matching_task();

create function public.claim_ai_job_matching_task(p_job_ids uuid[] default null)
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
    and q.locked_at < pg_catalog.now() - interval '10 minutes'
    and (p_job_ids is null or q.job_id = any(p_job_ids));

  select q.id into claimed_id
  from public.ai_task_queue as q
  where q.status = 'pending'
    and q.available_at <= pg_catalog.now()
    and (p_job_ids is null or q.job_id = any(p_job_ids))
  order by q.available_at, q.created_at
  for update skip locked
  limit 1;

  if claimed_id is null then
    return;
  end if;

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

revoke all on function public.claim_ai_job_matching_task(uuid[])
  from public, anon, authenticated;
grant execute on function public.claim_ai_job_matching_task(uuid[])
  to service_role;
