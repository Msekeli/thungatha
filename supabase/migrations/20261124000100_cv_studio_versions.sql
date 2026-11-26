-- M4-C02: persist structured CV versions and evidence-backed suggestion decisions.
-- CV content is canonical; PDF exports are generated on demand and are not stored here.

create table public.cv_versions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null
    references public.profiles(user_id) on delete cascade,
  version_number bigint generated always as identity,
  cv_kind text not null check (cv_kind in ('master', 'tailored')),
  status text not null check (status in ('current', 'draft', 'accepted', 'superseded')),
  parent_version_id uuid,
  source_profile_version integer not null check (source_profile_version > 0),
  source_job_id uuid references public.jobs(id) on delete set null,
  source_job_snapshot jsonb,
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  suggestions jsonb not null default '[]'::jsonb check (jsonb_typeof(suggestions) = 'array'),
  template_version text not null check (char_length(template_version) between 1 and 50),
  accent_colour text not null default 'teal'
    check (accent_colour in ('teal', 'navy', 'burgundy', 'forest')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  accepted_at timestamptz,
  constraint cv_versions_user_version_unique unique (user_id, version_number),
  constraint cv_versions_user_id_unique unique (user_id, id),
  constraint cv_versions_parent_fk foreign key (user_id, parent_version_id)
    references public.cv_versions(user_id, id) on delete set null (parent_version_id),
  constraint cv_versions_profile_version_fk foreign key (user_id, source_profile_version)
    references public.profile_versions(user_id, version) on delete cascade,
  constraint cv_versions_status_kind_check check (
    (cv_kind = 'master' and status in ('current', 'superseded'))
    or (cv_kind = 'tailored' and status in ('draft', 'accepted'))
  ),
  constraint cv_versions_accepted_timestamp_check check (
    (status = 'accepted' and accepted_at is not null)
    or (status in ('draft', 'current') and accepted_at is null)
    or status = 'superseded'
  ),
  constraint cv_versions_tailored_job_snapshot_check check (
    (cv_kind = 'master' and source_job_snapshot is null)
    or (cv_kind = 'tailored' and jsonb_typeof(source_job_snapshot) = 'object')
  )
);

create index cv_versions_user_kind_status_idx
  on public.cv_versions (user_id, cv_kind, status, updated_at desc);
create index cv_versions_user_job_idx
  on public.cv_versions (user_id, source_job_id)
  where source_job_id is not null;

create unique index cv_versions_one_current_master_per_user_idx
  on public.cv_versions (user_id)
  where cv_kind = 'master' and status = 'current';

alter table public.cv_versions enable row level security;
revoke all on public.cv_versions from public, anon, authenticated;
grant select, insert, update, delete on public.cv_versions to authenticated;

create policy "Users can read their own CV versions"
  on public.cv_versions for select to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can create their own CV versions"
  on public.cv_versions for insert to authenticated
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can update their own CV versions"
  on public.cv_versions for update to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id)
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can delete their own CV versions"
  on public.cv_versions for delete to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

-- Accepted content is immutable. A candidate may still delete their own records
-- through the owner-scoped delete policy if they request data removal.
create or replace function public.prevent_accepted_cv_version_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  if old.status = 'accepted' then
    raise exception 'Accepted CV versions are immutable';
  end if;
  return new;
end;
$$;

revoke all on function public.prevent_accepted_cv_version_mutation() from public, anon, authenticated;
create trigger cv_versions_prevent_accepted_update
  before update on public.cv_versions
  for each row execute function public.prevent_accepted_cv_version_mutation();
