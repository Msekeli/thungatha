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
  Typography,
} from "@mui/material";

type FilterOption = { label: string; value: string };
const modes: FilterOption[] = [
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
  { label: "On-site", value: "onsite" },
];

export function PublicJobFiltersPanel({
  modesSelected,
  setModesSelected,
  salary,
  setSalary,
  experience,
  setExperience,
  onClose,
  onClear,
}: {
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
    <Stack spacing={1.25} className="th-filter-content">
      <Stack spacing={0.25} className="th-filter-group">
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Work arrangement
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
          MenuProps={{ sx: { zIndex: 1500 } }}
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
          MenuProps={{ sx: { zIndex: 1500 } }}
          value={experience}
          onChange={(event) => setExperience(event.target.value)}
        >
          <MenuItem value="any">Any level</MenuItem>
          <MenuItem value="entry">Entry level</MenuItem>
          <MenuItem value="mid">Mid-level</MenuItem>
          <MenuItem value="senior">Senior</MenuItem>
        </Select>
      </FormControl>
      <Stack direction="row" justifyContent="space-between" sx={{ pt: 0.5 }}>
        <Button variant="text" size="small" onClick={onClear}>
          Reset
        </Button>
        <Button variant="contained" size="small" onClick={onClose}>
          Done
        </Button>
      </Stack>
    </Stack>
  );
}
