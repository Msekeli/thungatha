"use client";

import { Select } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

const options = [
  { value: "relevance", label: "Most relevant" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

export function PublicJobSortSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const label = options.find((item) => item.value === value)?.label ?? "Newest first";
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger aria-label={`Sort opportunities: ${label}`} className="inline-flex h-8 items-center gap-1 rounded-xl border border-public-card-border bg-public-card-bg px-3 text-detail font-semibold text-fg shadow-public-card outline-none hover:bg-panel-2 focus-visible:ring-2 focus-visible:ring-accent/40">
        <Select.Value>{label}</Select.Value>
        <Select.Icon><ChevronDown size={16} /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="z-50 outline-none" sideOffset={6} align="end">
          <Select.Popup className="min-w-48 rounded-panel border border-line bg-panel p-1 text-control text-fg shadow-lg">
            <Select.List>
              {options.map((option) => (
                <Select.Item key={option.value} value={option.value} className="flex cursor-default items-center justify-between gap-4 rounded-control px-3 py-2 outline-none data-[highlighted]:bg-panel-2">
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator><Check size={14} /></Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
