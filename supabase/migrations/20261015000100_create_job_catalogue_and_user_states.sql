-- M1-C02: normalized job catalogue, source records and private user state.
-- Job ingestion writes will use a controlled server-side path.
-- Never expose a Supabase service-role key to the browser.

create table public.jobs (
  id uuid primary key default gen_random_uuid(),

  title text not null
    check (char_length(trim(title)) between 1 and 300),

  employer_name text
    check (
      employer_name is null
      or char_length(employer_name) <= 300
    ),

  description text,
  location_text text,
  country_code text
    check (
      country_code is null
      or country_code ~ '^[A-Z]{2}$'
    ),

  work_mode text not null default 'unknown'
    check (work_mode in ('onsite', 'hybrid', 'remote', 'unknown')),

  employment_type text,

  salary_min numeric(14, 2)
    check (salary_min is null or salary_min >= 0),

  salary_max numeric(14, 2)
    check (salary_max is null or salary_max >= 0),

  salary_currency text
    check (
      salary_currency is null
      or salary_currency ~ '^[A-Z]{3}$'
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint jobs_salary_range_check
    check (
      salary_min is null
      or salary_max is null
      or salary_max >= salary_min
    )
);

create table public.job_sources (
  id uuid primary key default gen_random_uuid(),

  job_id uuid not null
    references public.jobs(id) on delete restrict,

  provider_key text not null
    check (provider_key ~ '^[a-z0-9_-]{1,80}$'),

  provider_kind text not null
    check (
      provider_kind in (
        'aggregator',
        'ats',
        'employer_site',
        'feed'
      )
    ),

  external_job_id text not null
    check (char_length(trim(external_job_id)) between 1 and 500),

  source_url text not null
    check (source_url ~ '^https?://'),

  application_url text
    check (
      application_url is null
      or application_url ~ '^https?://'
    ),

  published_at timestamptz,
  first_seen_at timestamptz not null default now(),
  last_checked_at timestamptz,
  last_seen_at timestamptz,

  availability_status text not null default 'unknown'
    check (
      availability_status in ('active', 'unavailable', 'unknown')
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint job_sources_provider_external_id_unique
    unique (provider_key, external_job_id),

  constraint job_sources_last_seen_after_first_seen
    check (last_seen_at is null or last_seen_at >= first_seen_at)
);

create table public.user_job_states (
  user_id text not null
    check (char_length(user_id) between 1 and 255),

  job_id uuid not null
    references public.jobs(id) on delete restrict,

  state text not null
    check (state in ('saved', 'dismissed')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (user_id, job_id)
);

-- Catalogue and provider lookup indexes.
create index jobs_title_lower_idx
  on public.jobs (lower(title));

create index jobs_employer_lower_idx
  on public.jobs (lower(employer_name))
  where employer_name is not null;

create index jobs_country_code_idx
  on public.jobs (country_code);

create index job_sources_job_id_idx
  on public.job_sources (job_id);

create index job_sources_provider_status_idx
  on public.job_sources (provider_key, availability_status);

create index user_job_states_user_state_idx
  on public.user_job_states (user_id, state);

-- Enable row-level security on all new tables.
alter table public.jobs enable row level security;
alter table public.job_sources enable row level security;
alter table public.user_job_states enable row level security;

-- Jobs are readable by authenticated users.
-- Writes are reserved for the controlled ingestion path.
revoke all on public.jobs from public, anon, authenticated;
grant select on public.jobs to authenticated;

create policy "Authenticated users can read jobs"
  on public.jobs
  for select
  to authenticated
  using ((select auth.jwt() ->> 'sub') is not null);

-- Source records are also readable, but not client-writable.
revoke all on public.job_sources from public, anon, authenticated;
grant select on public.job_sources to authenticated;

create policy "Authenticated users can read job sources"
  on public.job_sources
  for select
  to authenticated
  using ((select auth.jwt() ->> 'sub') is not null);

-- Each user can access only their own saved/dismissed states.
revoke all on public.user_job_states from public, anon, authenticated;
grant select, insert, update, delete
  on public.user_job_states to authenticated;

create policy "Users can read their own job states"
  on public.user_job_states
  for select
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can create their own job states"
  on public.user_job_states
  for insert
  to authenticated
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can update their own job states"
  on public.user_job_states
  for update
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id)
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can delete their own job states"
  on public.user_job_states
  for delete
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);
