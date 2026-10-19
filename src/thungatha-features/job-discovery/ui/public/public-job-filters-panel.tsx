"use client";

import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type FilterOption = { label: string; value: string; count?: number };
const types: FilterOption[] = [
  { label: "Full-time", value: "full_time" },
  { label: "Part-time", value: "part_time" },
  { label: "Contract", value: "contract" },
  { label: "Internships", value: "internship" },
  { label: "Learnerships", value: "learnership" },
  { label: "Graduate programmes", value: "graduate" },
];
const modes: FilterOption[] = [
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
  { label: "On-site", value: "onsite" },
];
const locations = [
  "Cape Town + 50 km",
  "Cape Town",
  "Johannesburg",
  "Durban",
  "Remote",
  "",
];

export function PublicJobFiltersPanel({
  query,
  setQuery,
  location,
  setLocation,
  typesSelected,
  setTypesSelected,
  modesSelected,
  setModesSelected,
  salary,
  setSalary,
  experience,
  setExperience,
  onClose,
  onClear,
}: {
  query: string;
  setQuery: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  typesSelected: string[];
  setTypesSelected: (value: string[]) => void;
  modesSelected: string[];
  setModesSelected: (value: string[]) => void;
  salary: string;
  setSalary: (value: string) => void;
  experience: string;
  setExperience: (value: string) => void;
  onClose: () => void;
  onClear: () => void;
}) {
  const toggle = (
    values: string[],
    value: string,
    setter: (next: string[]) => void,
  ) =>
    setter(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );
  return (
    <Stack spacing={2} className="th-filter-content">
      <TextField
        label="Search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Job title, skills or company..."
        fullWidth
        size="small"
      />
      <FormControl fullWidth size="small">
        <InputLabel id="th-location-label">Location</InputLabel>
        <Select
          labelId="th-location-label"
          label="Location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        >
          {locations.map((value) => (
            <MenuItem key={value || "anywhere"} value={value}>
              {value || "Anywhere"}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Stack spacing={0.25} className="th-filter-group">
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Job type
        </Typography>
        {types.map((item) => (
          <FormControlLabel
            key={item.value}
            control={
              <Checkbox
                size="small"
                checked={typesSelected.includes(item.value)}
                onChange={() =>
                  toggle(typesSelected, item.value, setTypesSelected)
                }
              />
            }
            label={item.label}
          />
        ))}
      </Stack>
      <Stack spacing={0.25} className="th-filter-group">
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Remote options
        </Typography>
        {modes.map((item) => (
          <FormControlLabel
            key={item.value}
            control={
              <Checkbox
                size="small"
                checked={modesSelected.includes(item.value)}
                onChange={() =>
                  toggle(modesSelected, item.value, setModesSelected)
                }
              />
            }
            label={item.label}
          />
        ))}
      </Stack>
      <FormControl fullWidth size="small">
        <InputLabel id="th-salary-label">Salary range</InputLabel>
        <Select
          labelId="th-salary-label"
          label="Salary range"
          value={salary}
          onChange={(event) => setSalary(event.target.value)}
        >
          <MenuItem value="any">Any salary</MenuItem>
          <MenuItem value="disclosed">Salary disclosed</MenuItem>
          <MenuItem value="above50">R500,000+ per year</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel id="th-experience-label">Experience level</InputLabel>
        <Select
          labelId="th-experience-label"
          label="Experience level"
          value={experience}
          onChange={(event) => setExperience(event.target.value)}
        >
          <MenuItem value="any">Any level</MenuItem>
          <MenuItem value="entry">Entry level</MenuItem>
          <MenuItem value="mid">Mid-level</MenuItem>
          <MenuItem value="senior">Senior</MenuItem>
        </Select>
      </FormControl>
      <Stack direction="row" className="th-mobile-filter-actions">
        <Button variant="text" onClick={onClear}>Reset</Button>
        <Button
          className="th-mobile-apply-filters"
          variant="contained"
          onClick={onClose}
        >
          Apply filters
        </Button>
      </Stack>
    </Stack>
  );
}
