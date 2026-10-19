"use client";

import { Search, X } from "lucide-react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

type JobSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
};

export function JobSearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Job title, skill, or company",
}: JobSearchBarProps) {
  return (
    <form
      className="w-full"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <TextField
        fullWidth
        size="small"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        inputProps={{ "aria-label": "Search jobs" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={17} aria-hidden="true" />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                aria-label="Clear job search"
                onClick={() => onChange("")}
              >
                <X size={15} />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        }}
      />
    </form>
  );
}
