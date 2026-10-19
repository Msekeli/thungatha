"use client";

import type { FormEvent } from "react";
import { Search } from "lucide-react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

type JobSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  placeholder?: string;
  suggestions?: string[];
};

export function JobSearchBar({ value, onChange, onSubmit, placeholder = "Job title, skill, or company", suggestions = [] }: JobSearchBarProps) {
  const options = [...new Set(suggestions.map((item) => item.trim()).filter(Boolean))];
  return (
    <form className="w-full" role="search" onSubmit={(event) => {
      event.preventDefault();
      onSubmit?.(event);
    }}>
      <Autocomplete freeSolo fullWidth options={options} value={value} inputValue={value} forcePopupIcon={false}
        clearOnEscape onInputChange={(_, nextValue) => onChange(nextValue)}
        onChange={(_, nextValue) => onChange(typeof nextValue === "string" ? nextValue : "")}
        noOptionsText="Keep typing to search jobs"
        renderInput={(params) => (
          <TextField {...params} fullWidth size="medium" placeholder={placeholder}
            slotProps={{
              ...params.slotProps,
              htmlInput: { ...params.slotProps.htmlInput, "aria-label": "Search roles, skills, or companies" },
              input: { ...params.slotProps.input, startAdornment: (
                <>
                  <InputAdornment position="start"><Search size={18} aria-hidden="true" /></InputAdornment>
                  {params.slotProps.input.startAdornment}
                </>
              ) },
            }} />
        )} />
    </form>
  );
}
