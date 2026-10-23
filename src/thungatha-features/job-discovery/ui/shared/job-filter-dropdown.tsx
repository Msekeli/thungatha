"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JobFilterOption } from "./job-filter-options";

type Props = {
  label: string;
  value: string;
  options: JobFilterOption[];
  onChange: (value: string) => void;
  open: boolean;
  onToggle: () => void;
};

export function JobFilterDropdown({
  label,
  value,
  options,
  onChange,
  open,
  onToggle,
}: Props) {
  const selected =
    options.find((option) => option.value === value) ?? options[0];
  return (
    <div className="th-filter-dropdown">
      <Button
        variant="outline"
        className="h-auto min-h-10 w-full justify-between px-3 py-1.5 text-left"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="flex min-w-0 flex-col items-start">
          <span className="text-xs text-fg-muted">{label}</span>
          <span className="text-sm font-semibold">{selected.label}</span>
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>
      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="mt-1 rounded-lg border border-line bg-panel p-1"
        >
          {options.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              className="w-full justify-start"
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onChange(option.value);
                onToggle();
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
