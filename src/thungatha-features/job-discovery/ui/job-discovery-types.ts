export type Job = {
  id: string;
  scout_vacancy_id: string;
  title: string;
  employer_name: string;
  company_logo_url: string | null;
  description: string;
  location_text: string;
  application_url: string;
  published_at: string | null;
  source_updated_at: string | null;
  updated_at: string;
  state: "saved" | "dismissed" | null;
};

export type JobActivity = {
  application_link_opened_at: string | null;
  applied_at: string | null;
};

export type Feed = {
  jobs: Job[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type Filters = {
  query: string;
  location: string;
  publishedWithin: string;
};

export const EMPTY_FILTERS: Filters = {
  query: "",
  location: "",
  publishedWithin: "any",
};

export const PAGE_SIZE = 30;
