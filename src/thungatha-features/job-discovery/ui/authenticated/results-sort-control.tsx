"use client";

import { Select } from "@base-ui/react/select";
import { ArrowDownWideNarrow, Check, ChevronDown } from "lucide-react";

const options = [
  { value: "relevance", label: "Most relevant" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

export function JobResultsSortControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const label =
    options.find((option) => option.value === value)?.label ?? "Newest first";

  return (
    <div className="flex shrink-0 items-center gap-2 max-[700px]:gap-1">
      <ArrowDownWideNarrow
        size={16}
        className="shrink-0 text-[var(--th-fg-muted)] max-[700px]:hidden"
        aria-hidden="true"
      />
      <Select.Root
        value={value}
        onValueChange={(next) => next !== null && onChange(next)}
      >
        <Select.Trigger
          aria-label={`Sort opportunities: ${label}`}
          className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-lg bg-transparent px-2 text-sm font-medium text-fg outline-none hover:bg-[var(--th-line)]/40 focus-visible:ring-2 focus-visible:ring-[var(--th-accent)]/30 max-[700px]:h-10 max-[700px]:gap-1 max-[700px]:px-1 max-[700px]:text-xs"
        >
          <Select.Value>{label}</Select.Value>
          <Select.Icon className="inline-flex text-[var(--th-fg-muted)]">
            <ChevronDown size={16} aria-hidden="true" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner
            className="z-50 outline-none"
            sideOffset={6}
            align="end"
          >
            <Select.Popup className="min-w-52 rounded-xl border border-[var(--th-line)] bg-[var(--th-panel)] p-1 text-sm text-[var(--th-fg)] shadow-lg outline-none">
              <Select.List>
                {options.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    className="flex cursor-default items-center justify-between gap-4 rounded-lg px-3 py-2 outline-none data-[highlighted]:bg-[var(--th-line)]/50"
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator>
                      <Check size={14} aria-hidden="true" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
