-- Extend public.profiles table for M2 Profile & CV Import.
-- Adds personal details, summary, structured sections (experience, education, skills,
-- certifications, projects), master CV metadata, and profile confirmation timestamp.

alter table public.profiles
  add column if not exists full_name text check (full_name is null or char_length(full_name) between 1 and 150),
  add column if not exists email text check (email is null or char_length(email) between 3 and 255),
  add column if not exists phone text check (phone is null or char_length(phone) between 1 and 50),
  add column if not exists location text check (location is null or char_length(location) between 1 and 150),
  add column if not exists linkedin_url text check (linkedin_url is null or char_length(linkedin_url) between 1 and 255),
  add column if not exists portfolio_url text check (portfolio_url is null or char_length(portfolio_url) between 1 and 255),
  add column if not exists summary text check (summary is null or char_length(summary) <= 5000),
  add column if not exists experience jsonb not null default '[]'::jsonb,
  add column if not exists education jsonb not null default '[]'::jsonb,
  add column if not exists skills jsonb not null default '[]'::jsonb,
  add column if not exists certifications jsonb not null default '[]'::jsonb,
  add column if not exists projects jsonb not null default '[]'::jsonb,
  add column if not exists master_cv jsonb check (master_cv is null or jsonb_typeof(master_cv) = 'object'),
  add column if not exists confirmed_at timestamptz;

comment on column public.profiles.full_name is 'Full name of the candidate';
comment on column public.profiles.summary is 'Professional profile summary statement';
comment on column public.profiles.experience is 'Array of work experience objects';
comment on column public.profiles.education is 'Array of education objects';
comment on column public.profiles.skills is 'Array of skill names/tags';
comment on column public.profiles.certifications is 'Array of certification objects';
comment on column public.profiles.projects is 'Array of project objects';
comment on column public.profiles.master_cv is 'Metadata of the active master CV file';
comment on column public.profiles.confirmed_at is 'Timestamp when the user explicitly confirmed their profile';
