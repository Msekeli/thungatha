-- M1-C08: per-user application-link activity and explicit applied confirmation.
-- Opening an external link is only a visit event; applied_at is set only after explicit user confirmation.

create table public.user_job_activity (
  user_id text not null
    check (char_length(user_id) between 1 and 255),
  job_id uuid not null
    references public.jobs(id) on delete restrict,
  application_link_opened_at timestamptz,
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

create index user_job_activity_user_applied_idx
  on public.user_job_activity (user_id, applied_at);

alter table public.user_job_activity enable row level security;

revoke all on public.user_job_activity from public, anon, authenticated;
grant select, insert, update on public.user_job_activity to authenticated;

create policy "Users can read their own job activity"
  on public.user_job_activity
  for select
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can create their own job activity"
  on public.user_job_activity
  for insert
  to authenticated
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can update their own job activity"
  on public.user_job_activity
  for update
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id)
  with check ((select auth.jwt() ->> 'sub') = user_id);
