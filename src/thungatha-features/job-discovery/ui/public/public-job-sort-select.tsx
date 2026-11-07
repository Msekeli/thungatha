"use client";

import { Select } from "@base-ui/react/select";
import { ArrowDownWideNarrow, Check, ChevronDown } from "lucide-react";

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
    <Select.Root
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue !== null) onChange(nextValue);
      }}
    >
      <Select.Trigger aria-label={`Sort opportunities: ${label}`} className="inline-flex h-8 max-w-full items-center gap-2 rounded-md border border-public-card-border bg-public-card-bg px-3 text-detail font-semibold shadow-public-card outline-none hover:bg-panel-2 focus-visible:ring-2 focus-visible:ring-accent/40 max-[700px]:h-7 max-[700px]:gap-1.5 max-[700px]:px-2 max-[700px]:text-[11px]">
        <ArrowDownWideNarrow size={19} aria-hidden="true" className="shrink-0 text-fg" />
        <Select.Value>{label}</Select.Value>
        <Select.Icon><ChevronDown size={15} className="shrink-0 text-fg" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="z-50 outline-none" sideOffset={6} align="end">
          <Select.Popup className="min-w-48 rounded-lg border border-line bg-panel p-1 text-control text-fg shadow-lg">
            <Select.List>
              {options.map((option) => (
                <Select.Item key={option.value} value={option.value} className="flex cursor-default items-center justify-between gap-4 rounded-md px-3 py-2 outline-none data-[highlighted]:bg-panel-2">
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
