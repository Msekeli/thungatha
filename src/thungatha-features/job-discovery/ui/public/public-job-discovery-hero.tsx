"use client";
import {
  Box,
  Button,
  Chip,
  FormControl,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { SlidersHorizontal } from "lucide-react";
import { JobSearchBar } from "../shared/job-search-bar";
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
const jobTypes = [
  { label: "All opportunities", value: "all" },
  { label: "Full-time", value: "full_time" },
  { label: "Part-time", value: "part_time" },
  { label: "Contract", value: "contract" },
  { label: "Internships", value: "internship" },
  { label: "Learnerships", value: "learnership" },
  { label: "Graduate programmes", value: "graduate" },
];
const pillSx = (active: boolean) => ({
  height: 30,
  borderRadius: "999px",
  px: 1.1,
  fontWeight: 600,
  borderColor: active ? "primary.main" : "divider",
  color: active ? "primary.main" : "text.primary",
  backgroundColor: active ? "rgba(0,188,242,.12)" : "transparent",
  "& .MuiChip-label": { px: 1.1 },
});
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
          <FormControl
            size="small"
            sx={{ flex: 1, minWidth: 0, width: { md: 290 } }}
          >
            <Select
              value={location}
              onChange={(event) => onLocationChange(event.target.value)}
              inputProps={{ "aria-label": "Search location" }}
              sx={{
                height: 44,
                borderRadius: "12px",
                backgroundColor: "background.paper",
                fontSize: 15,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "divider",
                },
              }}
            >
              <MenuItem value="Cape Town + 50 km">Cape Town + 50 km</MenuItem>
              <MenuItem value="Cape Town">Cape Town</MenuItem>
              <MenuItem value="Johannesburg">Johannesburg</MenuItem>
              <MenuItem value="Durban">Durban</MenuItem>
              <MenuItem value="Remote">Remote</MenuItem>
              <MenuItem value="">Anywhere</MenuItem>
            </Select>
          </FormControl>
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
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mt: 1,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "center",
        }}
      >
        {jobTypes.map((item) => (
          <Chip
            key={item.value}
            clickable
            label={
              item.value === "all" ? `${item.label} · ${total}` : item.label
            }
            color={quickType === item.value ? "primary" : "default"}
            variant={quickType === item.value ? "filled" : "outlined"}
            sx={pillSx(quickType === item.value)}
            onClick={() => {
              onQuickTypeChange(item.value);
              onClearTypes();
              document
                .getElementById("jobs")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        ))}
      </Stack>
    </JobDiscoveryHeroShell>
  );
}
