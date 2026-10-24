"use client";

import { ChevronDown, MapPin } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
};

export function JobLocationSelect({
  value,
  onChange,
  ariaLabel = "Search location",
}: Props) {
  return (
    <div className="relative flex h-11 min-w-0 flex-1 items-center rounded-xl border border-[var(--th-line)] bg-[var(--th-panel)] text-[var(--th-fg)] transition-colors focus-within:border-[var(--th-accent)] focus-within:ring-2 focus-within:ring-[var(--th-accent)]/15 md:flex-none">
      <MapPin
        className="pointer-events-none absolute left-3 size-[17px] shrink-0 text-[var(--th-accent)]"
        aria-hidden="true"
      />
      <select
        aria-label={ariaLabel}
        value={value || "Anywhere"}
        onChange={(event) =>
          onChange(event.target.value === "Anywhere" ? "" : event.target.value)
        }
        className="h-full w-full min-w-0 cursor-pointer appearance-none rounded-xl bg-transparent py-0 pl-9 pr-9 text-sm font-medium text-[var(--th-fg)] outline-none"
      >
        <option value="Anywhere">Anywhere</option>
        <option value="Cape Town">Cape Town</option>
        <option value="Johannesburg">Johannesburg</option>
        <option value="Durban">Durban</option>
        <option value="Remote">Remote</option>
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 size-4 text-[var(--th-fg-muted)]"
        aria-hidden="true"
      />
    </div>
  );
}
