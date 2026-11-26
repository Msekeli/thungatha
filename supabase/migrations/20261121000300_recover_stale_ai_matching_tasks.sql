-- Recover tasks left in processing if a worker crashes or times out.
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
      updated_at = pg_catalog.now()
  where q.status = 'processing'
    and q.locked_at < pg_catalog.now() - interval '5 minutes';

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
