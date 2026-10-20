"use client";
import {
  Box,
  Button,
  Stack,
} from "@mui/material";
import { SlidersHorizontal } from "lucide-react";
import { JobSearchBar } from "../shared/job-search-bar";
import { JobLocationSelect, JobTypeChips } from "../shared/job-discovery-controls";
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
const publicTypeKey: Record<string, string> = {
  all: "all",
  full_time: "full-time",
  part_time: "part-time",
  contract: "contract",
  internship: "internship",
  learnership: "learnership",
  graduate: "graduate",
};
const publicTypeValue: Record<string, string> = {
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
    query,
    onQueryChange,
    location,
    onLocationChange,
    jobs,
    quickType,
    onQuickTypeChange,
    onClearTypes,
    total,
    onOpenFilters,
  } = props;
  const suggestions = jobs.flatMap((job) => [
    job.title,
    job.employer_name ?? "",
  ]);
  return (
    <JobDiscoveryHeroShell
      title={
        <>
          Find your next{" "}
          <Box component="span" sx={{ color: "primary.main" }}>
            opportunity
          </Box>
        </>
      }
      description="Explore thousands of jobs in South Africa and beyond. Create an account to tailor your CV, save jobs and track your applications."
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1}
        sx={{ width: "min(100%, 1010px)", alignItems: "stretch", mx: "auto" }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <JobSearchBar
            value={query}
            onChange={onQueryChange}
            onSubmit={() =>
              document
                .getElementById("jobs")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            placeholder="Job title, skills or company..."
            suggestions={suggestions}
          />
        </Box>
        <Stack
          direction="row"
          spacing={1}
          sx={{ minWidth: 0, flex: { md: "0 0 auto" } }}
        >
          <Box sx={{ flex: 1, minWidth: 0, width: { md: 290 } }}>
            <JobLocationSelect value={location} onChange={onLocationChange} />
          </Box>
          <Button
            variant="contained"
            aria-label="Open filters"
            onClick={(event) => onOpenFilters(event.currentTarget)}
            startIcon={<SlidersHorizontal size={18} />}
            sx={{
              minWidth: { xs: 44, md: 116 },
              width: { xs: 44, md: "auto" },
              px: { xs: 0, md: 2 },
              height: 44,
              borderRadius: "12px",
              fontWeight: 700,
              boxShadow: "none",
              "& .MuiButton-startIcon": { ml: 0, mr: { xs: 0, md: 1 } },
            }}
          >
            <Box
              component="span"
              sx={{ display: { xs: "none", md: "inline" } }}
            >
              Filters
            </Box>
          </Button>
        </Stack>
      </Stack>
      <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
        <JobTypeChips
          activeKey={publicTypeKey[quickType] ?? "all"}
          counts={{ all: total }}
          onSelect={(key) => {
            onQuickTypeChange(publicTypeValue[key] ?? "all");
            onClearTypes();
            document
              .getElementById("jobs")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          showAllCount
        />
      </Box>
    </JobDiscoveryHeroShell>
  );
}
