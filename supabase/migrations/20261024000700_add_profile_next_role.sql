-- Store the user's optional target role without treating it as an industry or hard filter.
alter table public.profiles
  add column if not exists next_role text
  check (next_role is null or char_length(next_role) <= 150);

-- Keep old version snapshots structurally consistent without inventing a preference.
update public.profile_versions
set profile_snapshot = profile_snapshot || jsonb_build_object('nextRole', null)
where not (profile_snapshot ? 'nextRole');

create or replace function public.snapshot_profile_version()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profile_versions (user_id, version, profile_snapshot, confirmed_at)
  values (new.user_id, new.profile_version, pg_catalog.jsonb_build_object(
    'displayName', new.display_name,
    'nextRole', new.next_role,
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
