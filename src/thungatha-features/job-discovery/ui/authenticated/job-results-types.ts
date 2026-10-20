import type { RefObject } from "react";

export type JobSource = {
  id: string;
  provider_key: string;
  provider_kind: string;
  external_job_id: string;
  source_url: string | null;
  application_url: string | null;
  published_at: string | null;
  availability_status: string;
};
export type Job = {
  id: string;
  title: string;
  employer_name: string | null;
  description: string | null;
  location_text: string | null;
  country_code: string | null;
  work_mode: "onsite" | "hybrid" | "remote" | "unknown" | null;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  updated_at: string | null;
  job_sources: JobSource[] | JobSource | null;
  state: "saved" | "dismissed" | null;
};
export type Feed = { page: number; totalPages: number; total: number };
export type JobResultsPanelProps = {
  jobs: Job[];
  feed: Feed | null;
  loading: boolean;
  error: string | null;
  hasFilters: boolean;
  mobileDetail: boolean;
  selectedId: string | null;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  sourceFor: (job: Job | null) => JobSource | null;
  formatDate: (value: string | null | undefined) => string | null;
  onRetry: () => void;
  onSelect: (job: Job) => void;
  onSave: (job: Job) => void;
};
