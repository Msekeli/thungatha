"use client";

import type { FormEvent } from "react";
import { Box, Button, Stack } from "@mui/material";
import { SlidersHorizontal } from "lucide-react";
import { JobSearchBar } from "./job-search-bar";
import { JobLocationSelect, JobTypeChips } from "./job-discovery-controls";

export type JobDiscoveryBarItem = {
  title: string;
  employer_name?: string | null;
};

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  jobs: JobDiscoveryBarItem[];
  selectedType: string;
  total: number;
  onTypeChange: (key: string, label: string) => void;
  onClearTypes?: () => void;
  onOpenFilters: (anchorEl: HTMLElement) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
};

const typeKeyByValue: Record<string, string> = {
  all: "all",
  full_time: "full-time",
  part_time: "part-time",
  contract: "contract",
  internship: "internship",
  learnership: "learnership",
  graduate: "graduate",
};

export function JobDiscoveryBar({
  query,
  onQueryChange,
  location,
  onLocationChange,
  jobs,
  selectedType,
  total,
  onTypeChange,
  onClearTypes,
  onOpenFilters,
  onSubmit,
}: Props) {
  const suggestions = (jobs ?? []).flatMap((job) => [
    job.title,
    job.employer_name ?? "",
  ]);
  return (
    <Box sx={{ width: "100%" }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1}
        sx={{ width: "min(100%, 1010px)", alignItems: "stretch", mx: "auto" }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <JobSearchBar
            value={query}
            onChange={onQueryChange}
            onSubmit={onSubmit}
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
            <JobLocationSelect
              value={location}
              onChange={onLocationChange}
              compact
              anywhereValue=""
            />
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
          activeKey={typeKeyByValue[selectedType] ?? selectedType ?? "all"}
          counts={{ all: total }}
          onSelect={(key, label) => {
            onTypeChange(key, label);
            onClearTypes?.();
          }}
          showAllCount
          justifyContent="center"
        />
      </Box>
    </Box>
  );
}
