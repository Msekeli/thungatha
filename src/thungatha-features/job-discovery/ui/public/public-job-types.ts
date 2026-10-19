export type PublicJobSource = {
  source_url: string | null;
  application_url: string | null;
  published_at: string | null;
  availability_status: string;
  provider_kind: string;
};

export type PublicJob = {
  id: string;
  title: string;
  employer_name: string | null;
  description: string | null;
  location_text: string | null;
  country_code: string | null;
  work_mode: string | null;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  updated_at: string | null;
  job_sources: PublicJobSource[] | PublicJobSource | null;
  state: "saved" | "dismissed" | null;
};
