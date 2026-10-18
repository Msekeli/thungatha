import type { JobSearchQuery, NormalizedJob } from "./schema";

export interface JobProvider {
  readonly key: string;
  readonly kind: "aggregator" | "ats" | "employer_site" | "feed";

  searchJobs(query: JobSearchQuery): Promise<NormalizedJob[]>;
}
