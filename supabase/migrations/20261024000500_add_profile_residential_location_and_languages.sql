-- Extend the profession-neutral profile with residential-area location and optional career context.
-- No street address or house number is collected.
alter table public.profiles
  add column if not exists residential_suburb text check (residential_suburb is null or char_length(residential_suburb) <= 150),
  add column if not exists residential_city text check (residential_city is null or char_length(residential_city) <= 150),
  add column if not exists residential_province text check (residential_province is null or char_length(residential_province) <= 150),
  add column if not exists residential_postal_code text check (residential_postal_code is null or char_length(residential_postal_code) <= 20),
  add column if not exists languages jsonb not null default '[]'::jsonb check (jsonb_typeof(languages) = 'array'),
  add column if not exists personal_attributes jsonb not null default '[]'::jsonb check (jsonb_typeof(personal_attributes) = 'array');

-- Preserve a consistent shape in existing snapshots without inventing historical values.
update public.profile_versions
set profile_snapshot = profile_snapshot
  || jsonb_build_object('languages', '[]'::jsonb, 'personalAttributes', '[]'::jsonb)
  || jsonb_build_object(
    'personalDetails',
    coalesce(profile_snapshot -> 'personalDetails', '{}'::jsonb)
      || jsonb_build_object(
        'residentialSuburb', null,
        'residentialCity', null,
        'residentialProvince', null,
        'residentialPostalCode', null
      )
  );

create or replace function public.snapshot_profile_version()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profile_versions (user_id, version, profile_snapshot, confirmed_at)
  values (new.user_id, new.profile_version, pg_catalog.jsonb_build_object(
    'displayName', new.display_name,
    'personalDetails', pg_catalog.jsonb_build_object(
      'fullName', new.full_name, 'email', new.email, 'phone', new.phone,
      'location', new.location, 'country', new.country,
      'residentialSuburb', new.residential_suburb,
      'residentialCity', new.residential_city,
      'residentialProvince', new.residential_province,
      'residentialPostalCode', new.residential_postal_code,
      'linkedinUrl', new.linkedin_url, 'portfolioUrl', new.portfolio_url
    ),
    'summary', new.summary, 'workExperience', new.experience, 'education', new.education,
    'skills', new.skills, 'certifications', new.certifications, 'projects', new.projects,
    'languages', new.languages, 'personalAttributes', new.personal_attributes,
    'masterCv', new.master_cv, 'confirmedAt', new.confirmed_at
  ), new.confirmed_at)
  on conflict (user_id, version) do update
    set profile_snapshot = excluded.profile_snapshot, confirmed_at = excluded.confirmed_at;
  return new;
end;
$$;
revoke all on function public.snapshot_profile_version() from public, anon, authenticated;
