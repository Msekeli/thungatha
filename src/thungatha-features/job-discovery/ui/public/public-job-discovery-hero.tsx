"use client";

import { Box } from "@mui/material";
import { JobDiscoveryBar } from "../shared/job-discovery-bar";
import { JobDiscoveryHeroShell } from "../shared/job-discovery-hero-shell";

type JobSuggestion = { title: string; employer_name: string | null };
type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  jobs: JobSuggestion[];
  quickType: string;
  onQuickTypeChange: (value: string) => void;
  onClearTypes: () => void;
  total: number;
  onOpenFilters: (anchorEl: HTMLElement) => void;
};

const typeValues: Record<string, string> = {
  all: "all",
  "full-time": "full_time",
  "part-time": "part_time",
  contract: "contract",
  internship: "internship",
  learnership: "learnership",
  graduate: "graduate",
};

export function PublicJobDiscoveryHero(props: Props) {
  const {
    query, onQueryChange, location, onLocationChange, jobs, quickType,
    onQuickTypeChange, onClearTypes, total, onOpenFilters,
  } = props;

  return (
    <JobDiscoveryHeroShell
      title={<>Find your next <Box component="span" sx={{ color: "primary.main" }}>opportunity</Box></>}
      description="Explore thousands of jobs in South Africa and beyond. Create an account to tailor your CV, save jobs and track your applications."
    >
      <JobDiscoveryBar
        query={query}
        onQueryChange={onQueryChange}
        location={location}
        onLocationChange={onLocationChange}
        jobs={jobs}
        selectedType={quickType}
        total={total}
        onTypeChange={(key) => onQuickTypeChange(typeValues[key] ?? "all")}
        onClearTypes={onClearTypes}
        onOpenFilters={onOpenFilters}
        onSubmit={() => document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" })}
      />
    </JobDiscoveryHeroShell>
  );
}
