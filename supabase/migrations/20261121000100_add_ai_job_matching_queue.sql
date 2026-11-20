-- Versioned AI job understanding and candidate assessments.
create table if not exists public.job_ai_understandings (
  job_id uuid primary key references public.jobs(id) on delete cascade,
  description_hash text not null check (description_hash ~ '^[a-f0-9]{64}$'),
  analysis_version text not null,
  understanding jsonb not null,
  provider text not null,
  model text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_match_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(user_id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  profile_version integer not null check (profile_version > 0),
  job_description_hash text not null check (job_description_hash ~ '^[a-f0-9]{64}$'),
  assessment_version text not null,
  classification text not null check (classification in ('match', 'relevant', 'unclassified')),
  assessment jsonb not null,
  provider text not null,
  model text not null,
  created_at timestamptz not null default now(),
  unique (user_id, job_id, profile_version, job_description_hash, assessment_version)
);

create index if not exists job_match_assessments_user_version_idx
  on public.job_match_assessments (user_id, profile_version, classification);

alter table public.job_match_assessments enable row level security;
revoke all on table public.job_ai_understandings from public, anon, authenticated;
revoke all on table public.job_match_assessments from public, anon, authenticated;
grant select on table public.job_match_assessments to authenticated;

drop policy if exists "Users can read their own AI job assessments" on public.job_match_assessments;
create policy "Users can read their own AI job assessments"
  on public.job_match_assessments for select to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

create table if not exists public.ai_task_queue (
  id uuid primary key default gen_random_uuid(),
  dedupe_key text not null unique,
  task_type text not null check (task_type = 'job_fit_assessment'),
  user_id text not null references public.profiles(user_id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  profile_version integer not null check (profile_version > 0),
  job_description_hash text not null check (job_description_hash ~ '^[a-f0-9]{64}$'),
  assessment_version text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_task_queue_ready_idx
  on public.ai_task_queue (available_at, created_at)
  where status = 'pending';

alter table public.ai_task_queue enable row level security;
revoke all on table public.ai_task_queue from public, anon, authenticated;

create or replace function public.claim_ai_job_matching_task()
returns setof public.ai_task_queue
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed_id uuid;
begin
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
