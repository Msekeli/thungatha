-- Keep the task lease longer than the maximum application worker duration.
-- A crashed final attempt must become terminal instead of being retried forever.
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
  set status = case when q.attempts >= 4 then 'failed' else 'pending' end,
      locked_at = null,
      available_at = case
        when q.attempts >= 4 then q.available_at
        else pg_catalog.now()
      end,
      last_error = case
        when q.attempts >= 4 then coalesce(q.last_error, 'Worker lease expired on the final attempt.')
        else coalesce(q.last_error, 'Worker lease expired; task recovered for retry.')
      end,
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

revoke all on function public.claim_ai_job_matching_task() from public, anon, authenticated;
grant execute on function public.claim_ai_job_matching_task() to service_role;
