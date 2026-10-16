-- M1-C04: durable ingestion run ledger and controlled catalogue writes.
create table public.job_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  provider_key text not null check (provider_key ~ '^[a-z0-9_-]{1,80}$'),
  provider_kind text not null check (provider_kind in ('aggregator','ats','employer_site','feed')),
  status text not null default 'running' check (status in ('running','succeeded','partial','failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  received_count integer not null default 0 check (received_count >= 0),
  inserted_count integer not null default 0 check (inserted_count >= 0),
  updated_count integer not null default 0 check (updated_count >= 0),
  skipped_count integer not null default 0 check (skipped_count >= 0),
  error_count integer not null default 0 check (error_count >= 0),
  error_message text,
  check ((status = 'running' and finished_at is null) or (status <> 'running' and finished_at is not null))
);

create index job_ingestion_runs_provider_started_idx
  on public.job_ingestion_runs(provider_key, started_at desc);

alter table public.job_ingestion_runs enable row level security;
revoke all on public.job_ingestion_runs from public, anon, authenticated;

alter table public.job_sources add column upstream_source text;

create or replace function public.start_job_ingestion_run(p_provider_key text, p_provider_kind text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_provider_key is null or p_provider_key !~ '^[a-z0-9_-]{1,80}$'
     or p_provider_kind not in ('aggregator','ats','employer_site','feed') then
    raise exception 'Invalid provider identity';
  end if;

  insert into public.job_ingestion_runs(provider_key, provider_kind)
  values (p_provider_key, p_provider_kind)
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.persist_job_ingestion_batch(p_run_id uuid, p_jobs jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  item jsonb;
  job_id uuid;
  source_id uuid;
  run_provider text;
  run_kind text;
  n_received integer := 0;
  n_inserted integer := 0;
  n_updated integer := 0;
  n_skipped integer := 0;
  now_at timestamptz := now();
  title_value text;
  employer_value text;
  location_value text;
  url_value text;
  provider_value text;
  external_value text;
  application_value text;
  upstream_value text;
  employment_value text;
  description_value text;
  country_value text;
  work_mode_value text;
  currency_value text;
  salary_min_value numeric;
  salary_max_value numeric;
  published_value timestamptz;
  fingerprint text;
begin
  if jsonb_typeof(p_jobs) is distinct from 'array' then
    raise exception 'p_jobs must be an array';
  end if;

  select r.provider_key, r.provider_kind
    into run_provider, run_kind
    from public.job_ingestion_runs r
   where r.id = p_run_id and r.status = 'running'
   for update;

  if not found then
    raise exception 'Ingestion run missing or already finished';
  end if;

  for item in select value from jsonb_array_elements(p_jobs) loop
    n_received := n_received + 1;

    if jsonb_typeof(item) is distinct from 'object' then
      n_skipped := n_skipped + 1;
      continue;
    end if;

    title_value := nullif(btrim(item->>'title'), '');
    employer_value := nullif(btrim(item->>'employerName'), '');
    location_value := nullif(btrim(item->>'locationText'), '');
    url_value := nullif(btrim(item->>'sourceUrl'), '');
    provider_value := nullif(btrim(item->>'providerKey'), '');
    external_value := nullif(btrim(item->>'externalJobId'), '');
    application_value := case when item->>'applicationUrl' ~ '^https?://' then item->>'applicationUrl' else null end;
    upstream_value := nullif(btrim(item->>'upstreamSource'), '');
    employment_value := nullif(btrim(item->>'employmentType'), '');
    description_value := nullif(btrim(item->>'description'), '');
    country_value := case when item->>'countryCode' ~ '^[A-Z]{2}$' then item->>'countryCode' else null end;
    work_mode_value := case when item->>'workMode' in ('onsite','hybrid','remote','unknown') then item->>'workMode' else 'unknown' end;
    currency_value := case when item->>'salaryCurrency' ~ '^[A-Z]{3}$' then item->>'salaryCurrency' else null end;
    salary_min_value := null;
    salary_max_value := null;
    published_value := null;

    if title_value is null or char_length(title_value) > 300
       or employer_value is not null and char_length(employer_value) > 300
       or url_value is null or url_value !~ '^https?://'
       or external_value is null or char_length(external_value) > 500
       or provider_value is distinct from run_provider
       or item->>'providerKind' is distinct from run_kind then
      n_skipped := n_skipped + 1;
      continue;
    end if;

    -- Reject invalid, negative, or out-of-range salary values instead of aborting the batch.
    begin
      if coalesce(item->>'salaryMin','') ~ '^[0-9]+([.][0-9]{1,2})?$' then
        salary_min_value := (item->>'salaryMin')::numeric;
      end if;
      if coalesce(item->>'salaryMax','') ~ '^[0-9]+([.][0-9]{1,2})?$' then
        salary_max_value := (item->>'salaryMax')::numeric;
      end if;
    exception when others then
      salary_min_value := null;
      salary_max_value := null;
    end;

    if (salary_min_value is not null and salary_min_value > 999999999999.99)
       or (salary_max_value is not null and salary_max_value > 999999999999.99)
       or (salary_min_value is not null and salary_max_value is not null and salary_max_value < salary_min_value) then
      n_skipped := n_skipped + 1;
      continue;
    end if;

    begin
      if coalesce(item->>'publishedAt','') <> '' then
        published_value := (item->>'publishedAt')::timestamptz;
      end if;
    exception when others then
      published_value := null;
    end;

    fingerprint := lower(trim(url_value)) || E'\n' ||
      lower(trim(title_value)) || E'\n' ||
      coalesce(lower(trim(employer_value)), '') || E'\n' ||
      coalesce(lower(trim(location_value)), '');

    -- Serialize identical normalized records and external identities across concurrent runs.
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(fingerprint, 0));
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(run_provider || ':' || external_value, 0));

    select s.id, s.job_id
      into source_id, job_id
      from public.job_sources s
     where s.provider_key = provider_value and s.external_job_id = external_value
     for update;

    if source_id is not null then
      n_updated := n_updated + 1;
    else
      select j.id
        into job_id
        from public.jobs j
        join public.job_sources s on s.job_id = j.id
       where lower(trim(s.source_url)) = lower(trim(url_value))
         and lower(trim(j.title)) = lower(trim(title_value))
         and coalesce(lower(trim(j.employer_name)), '') = coalesce(lower(trim(employer_value)), '')
         and coalesce(lower(trim(j.location_text)), '') = coalesce(lower(trim(location_value)), '')
       order by s.first_seen_at, s.id
       limit 1;

      if job_id is null then
        insert into public.jobs(
          title, employer_name, description, location_text, country_code,
          work_mode, employment_type, salary_min, salary_max, salary_currency
        )
        values (
          title_value, employer_value, description_value, location_value, country_value,
          work_mode_value, employment_value, salary_min_value, salary_max_value, currency_value
        )
        returning id into job_id;
        n_inserted := n_inserted + 1;
      else
        n_updated := n_updated + 1;
      end if;
    end if;

    update public.jobs j
       set title = title_value,
           employer_name = coalesce(employer_value, j.employer_name),
           description = coalesce(description_value, j.description),
           location_text = coalesce(location_value, j.location_text),
           country_code = coalesce(country_value, j.country_code),
           work_mode = case when item->>'workMode' in ('onsite','hybrid','remote','unknown') then item->>'workMode' else j.work_mode end,
           employment_type = coalesce(employment_value, j.employment_type),
           salary_min = case
             when salary_min_value is null then j.salary_min
             when salary_max_value is not null then salary_min_value
             when j.salary_max is null or salary_min_value <= j.salary_max then salary_min_value
             else j.salary_min
           end,
           salary_max = case
             when salary_max_value is null then j.salary_max
             when salary_min_value is not null then salary_max_value
             when j.salary_min is null or salary_max_value >= j.salary_min then salary_max_value
             else j.salary_max
           end,
           salary_currency = coalesce(currency_value, j.salary_currency),
           updated_at = now_at
     where j.id = job_id;

    insert into public.job_sources(
      job_id, provider_key, provider_kind, external_job_id, upstream_source,
      source_url, application_url, published_at, last_checked_at, last_seen_at, availability_status
    )
    values (
      job_id, provider_value, run_kind, external_value, upstream_value,
      url_value, application_value, published_value, now_at, now_at, 'active'
    )
    on conflict (provider_key, external_job_id) do update
      set job_id = excluded.job_id,
          provider_kind = excluded.provider_kind,
          upstream_source = coalesce(excluded.upstream_source, public.job_sources.upstream_source),
          source_url = excluded.source_url,
          application_url = coalesce(excluded.application_url, public.job_sources.application_url),
          published_at = coalesce(excluded.published_at, public.job_sources.published_at),
          last_checked_at = now_at,
          last_seen_at = greatest(coalesce(public.job_sources.first_seen_at, now_at), now_at),
          availability_status = 'active',
          updated_at = now_at;
  end loop;

  update public.job_ingestion_runs
     set received_count = received_count + n_received,
         inserted_count = inserted_count + n_inserted,
         updated_count = updated_count + n_updated,
         skipped_count = skipped_count + n_skipped
   where id = p_run_id;

  return jsonb_build_object(
    'received', n_received,
    'inserted', n_inserted,
    'updated', n_updated,
    'skipped', n_skipped
  );
end;
$$;

create or replace function public.finish_job_ingestion_run(
  p_run_id uuid,
  p_status text,
  p_error_count integer default 0,
  p_error_message text default null,
  p_received_count integer default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('succeeded','partial','failed') then
    raise exception 'Invalid terminal status';
  end if;

  update public.job_ingestion_runs
     set status = p_status,
         finished_at = now(),
         error_count = greatest(p_error_count, 0),
         error_message = left(p_error_message, 2000),
         received_count = greatest(received_count, coalesce(p_received_count, received_count))
   where id = p_run_id and status = 'running';

  if not found then
    raise exception 'Ingestion run missing or already finished';
  end if;
end;
$$;

revoke all on function public.start_job_ingestion_run(text,text) from public, anon, authenticated;
revoke all on function public.persist_job_ingestion_batch(uuid,jsonb) from public, anon, authenticated;
revoke all on function public.finish_job_ingestion_run(uuid,text,integer,text,integer) from public, anon, authenticated;
grant execute on function public.start_job_ingestion_run(text,text) to service_role;
grant execute on function public.persist_job_ingestion_batch(uuid,jsonb) to service_role;
grant execute on function public.finish_job_ingestion_run(uuid,text,integer,text,integer) to service_role;
