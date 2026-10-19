"use client";

import { Box, Button, Chip, FormControl, MenuItem, Select, Stack, Typography } from "@mui/material";
import { MapPin, SlidersHorizontal } from "lucide-react";
import { JobSearchBar } from "../shared/job-search-bar";

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
  onOpenFilters: () => void;
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

export function PublicJobDiscoveryHero(props: Props) {
  const { query, onQueryChange, location, onLocationChange, jobs, quickType,
    onQuickTypeChange, onClearTypes, total, onOpenFilters } = props;
  const suggestions = jobs.flatMap((job) => [job.title, job.employer_name ?? ""]);

  return (
    <Box component="section" className="th-discovery-hero" sx={{ px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
      <Typography variant="h2" component="h1" sx={{ fontWeight: 800, fontSize: { xs: "2.2rem", md: "3.5rem" } }}>
        Find your next <Box component="span" sx={{ color: "primary.main" }}>opportunity</Box>
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3, maxWidth: 680 }}>
        Explore thousands of jobs in South Africa and beyond. Create an account to tailor your CV, save jobs and track your applications.
      </Typography>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ maxWidth: 1050 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}><JobSearchBar value={query} onChange={onQueryChange}
          onSubmit={() => document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" })}
          placeholder="Job title, skills or company..." suggestions={suggestions} /></Box>
        <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 210 } }}>
          <Select displayEmpty value={location} onChange={(event) => onLocationChange(event.target.value)}
            startAdornment={<MapPin size={15} style={{ marginRight: 8 }} />} inputProps={{ "aria-label": "Search location" }}>
            <MenuItem value="Cape Town + 50 km">Cape Town + 50 km</MenuItem>
            <MenuItem value="Cape Town">Cape Town</MenuItem>
            <MenuItem value="Johannesburg">Johannesburg</MenuItem>
            <MenuItem value="Durban">Durban</MenuItem>
            <MenuItem value="Remote">Remote</MenuItem>
            <MenuItem value="">Anywhere</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={onOpenFilters} startIcon={<SlidersHorizontal size={16} />}>Filters</Button>
      </Stack>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
        {jobTypes.map((item) => (
          <Chip key={item.value} clickable label={item.value === "all" ? `${item.label} · ${total}` : item.label}
            color={quickType === item.value ? "primary" : "default"}
            variant={quickType === item.value ? "filled" : "outlined"}
            onClick={() => {
              onQuickTypeChange(item.value);
              onClearTypes();
              document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }} />
        ))}
      </Stack>
    </Box>
  );
}
