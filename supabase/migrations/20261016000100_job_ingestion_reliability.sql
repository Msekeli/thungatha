-- M1-C04: durable ingestion run ledger and controlled catalogue writes.
create table public.job_ingestion_runs (
 id uuid primary key default gen_random_uuid(),
 provider_key text not null check(provider_key ~ '^[a-z0-9_-]{1,80}$'),
 provider_kind text not null check(provider_kind in ('aggregator','ats','employer_site','feed')),
 status text not null default 'running' check(status in ('running','succeeded','partial','failed')),
 started_at timestamptz not null default now(), finished_at timestamptz,
 received_count integer not null default 0 check(received_count>=0),
 inserted_count integer not null default 0 check(inserted_count>=0),
 updated_count integer not null default 0 check(updated_count>=0),
 skipped_count integer not null default 0 check(skipped_count>=0),
 error_count integer not null default 0 check(error_count>=0), error_message text,
 check((status='running' and finished_at is null) or (status<>'running' and finished_at is not null))
);
create index job_ingestion_runs_provider_started_idx on public.job_ingestion_runs(provider_key,started_at desc);
alter table public.job_ingestion_runs enable row level security;
revoke all on public.job_ingestion_runs from public,anon,authenticated;
alter table public.job_sources add column upstream_source text;

create or replace function public.start_job_ingestion_run(p_provider_key text,p_provider_kind text)
returns uuid language plpgsql security definer set search_path=''
as $$
declare v_id uuid;
begin
 if p_provider_key !~ '^[a-z0-9_-]{1,80}$' or p_provider_kind not in ('aggregator','ats','employer_site','feed') then raise exception 'Invalid provider identity'; end if;
 insert into public.job_ingestion_runs(provider_key,provider_kind) values(p_provider_key,p_provider_kind) returning id into v_id;
 return v_id;
end; $$;

create or replace function public.persist_job_ingestion_batch(p_run_id uuid,p_jobs jsonb)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare
 item jsonb; job_id uuid; existing_job_id uuid; source_id uuid;
 n_received int:=0; n_inserted int:=0; n_updated int:=0; n_skipped int:=0;
 now_at timestamptz:=now(); title_value text; employer_value text; location_value text; url_value text; provider_value text; external_value text;
begin
 if jsonb_typeof(p_jobs)<>'array' then raise exception 'p_jobs must be an array'; end if;
 perform 1 from public.job_ingestion_runs where id=p_run_id and status='running' for update;
 if not found then raise exception 'Ingestion run missing or already finished'; end if;
 for item in select value from jsonb_array_elements(p_jobs) loop
  n_received:=n_received+1;
  title_value:=nullif(btrim(item->>'title'),''); employer_value:=nullif(btrim(item->>'employerName'),'');
  location_value:=nullif(btrim(item->>'locationText'),''); url_value:=nullif(btrim(item->>'sourceUrl'),'');
  provider_value:=item->>'providerKey'; external_value:=nullif(btrim(item->>'externalJobId'),'');
  if title_value is null or url_value is null or url_value !~ '^https?://' or external_value is null or
     provider_value is distinct from (select provider_key from public.job_ingestion_runs where id=p_run_id) then
   n_skipped:=n_skipped+1; continue;
  end if;
  select s.id,s.job_id into source_id,existing_job_id from public.job_sources s
   where s.provider_key=provider_value and s.external_job_id=external_value for update;
  if source_id is not null then job_id:=existing_job_id; n_updated:=n_updated+1;
  else
   select j.id into job_id from public.jobs j join public.job_sources s on s.job_id=j.id
    where lower(trim(s.source_url))=lower(trim(url_value))
      and lower(trim(j.title))=lower(trim(title_value))
      and coalesce(lower(trim(j.employer_name)),'')=coalesce(lower(trim(employer_value)),'')
      and coalesce(lower(trim(j.location_text)),'')=coalesce(lower(trim(location_value)),'')
    order by s.first_seen_at limit 1;
   if job_id is null then
    insert into public.jobs(title,employer_name,description,location_text,country_code,work_mode,employment_type,salary_min,salary_max,salary_currency)
    values(title_value,employer_value,nullif(btrim(item->>'description'),''),location_value,
      case when item->>'countryCode' ~ '^[A-Z]{2}$' then item->>'countryCode' else null end,
      case when item->>'workMode' in ('onsite','hybrid','remote','unknown') then item->>'workMode' else 'unknown' end,
      nullif(btrim(item->>'employmentType'),''),
      case when (item->>'salaryMin') ~ '^[0-9]+([.][0-9]+)?$' then (item->>'salaryMin')::numeric else null end,
      case when (item->>'salaryMax') ~ '^[0-9]+([.][0-9]+)?$' then (item->>'salaryMax')::numeric else null end,
      case when item->>'salaryCurrency' ~ '^[A-Z]{3}$' then item->>'salaryCurrency' else null end)
    returning id into job_id; n_inserted:=n_inserted+1;
   else n_updated:=n_updated+1; end if;
  end if;
  update public.jobs j set title=title_value,
   employer_name=coalesce(employer_value,j.employer_name),
   description=coalesce(nullif(btrim(item->>'description'),''),j.description),
   location_text=coalesce(location_value,j.location_text),
   country_code=coalesce(case when item->>'countryCode' ~ '^[A-Z]{2}$' then item->>'countryCode' else null end,j.country_code),
   work_mode=case when item->>'workMode' in ('onsite','hybrid','remote') then item->>'workMode' else j.work_mode end,
   employment_type=coalesce(nullif(btrim(item->>'employmentType'),''),j.employment_type),
   salary_min=coalesce(case when (item->>'salaryMin') ~ '^[0-9]+([.][0-9]+)?$' then (item->>'salaryMin')::numeric else null end,j.salary_min),
   salary_max=coalesce(case when (item->>'salaryMax') ~ '^[0-9]+([.][0-9]+)?$' then (item->>'salaryMax')::numeric else null end,j.salary_max),
   salary_currency=coalesce(case when item->>'salaryCurrency' ~ '^[A-Z]{3}$' then item->>'salaryCurrency' else null end,j.salary_currency),
   updated_at=now_at where j.id=job_id;
  insert into public.job_sources(job_id,provider_key,provider_kind,external_job_id,upstream_source,source_url,application_url,published_at,last_checked_at,last_seen_at,availability_status)
  values(job_id,provider_value,item->>'providerKind',external_value,nullif(btrim(item->>'upstreamSource'),''),
   url_value,case when item->>'applicationUrl' ~ '^https?://' then item->>'applicationUrl' else null end,
   case when (item->>'publishedAt') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T' then (item->>'publishedAt')::timestamptz else null end,
   now_at,now_at,'active')
  on conflict(provider_key,external_job_id) do update set job_id=excluded.job_id,provider_kind=excluded.provider_kind,
   upstream_source=coalesce(excluded.upstream_source,public.job_sources.upstream_source),
   source_url=excluded.source_url,application_url=coalesce(excluded.application_url,public.job_sources.application_url),
   published_at=coalesce(excluded.published_at,public.job_sources.published_at),
   last_checked_at=now_at,last_seen_at=now_at,availability_status='active',updated_at=now_at;
 end loop;
 update public.job_ingestion_runs set received_count=received_count+n_received,inserted_count=inserted_count+n_inserted,
  updated_count=updated_count+n_updated,skipped_count=skipped_count+n_skipped where id=p_run_id;
 return jsonb_build_object('received',n_received,'inserted',n_inserted,'updated',n_updated,'skipped',n_skipped);
end; $$;

create or replace function public.finish_job_ingestion_run(p_run_id uuid,p_status text,p_error_count integer default 0,p_error_message text default null,p_received_count integer default null)
returns void language plpgsql security definer set search_path=''
as $$
begin
 if p_status not in ('succeeded','partial','failed') then raise exception 'Invalid terminal status'; end if;
 update public.job_ingestion_runs set status=p_status,finished_at=now(),error_count=greatest(p_error_count,0),error_message=left(p_error_message,2000),received_count=greatest(received_count,coalesce(p_received_count,received_count))
 where id=p_run_id and status='running';
 if not found then raise exception 'Ingestion run missing or already finished'; end if;
end; $$;
revoke all on function public.start_job_ingestion_run(text,text) from public,anon,authenticated;
revoke all on function public.persist_job_ingestion_batch(uuid,jsonb) from public,anon,authenticated;
revoke all on function public.finish_job_ingestion_run(uuid,text,integer,text,integer) from public,anon,authenticated;
grant execute on function public.start_job_ingestion_run(text,text) to service_role;
grant execute on function public.persist_job_ingestion_batch(uuid,jsonb) to service_role;
grant execute on function public.finish_job_ingestion_run(uuid,text,integer,text) to service_role;
