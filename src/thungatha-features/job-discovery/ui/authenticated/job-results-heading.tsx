import { ChevronDown, ArrowDownWideNarrow } from "lucide-react";

export function JobResultsHeading({
  loading,
  count,
  total,
  sortOrder,
  onSortChange,
}: {
  loading: boolean;
  count: number;
  total: number;
  sortOrder: string;
  onSortChange: (value: string) => void;
}) {
  const label = loading
    ? "Updating opportunities…"
    : count === 0
      ? "0 opportunities"
      : `1–${Math.min(count, total).toLocaleString()} of ${total.toLocaleString()} opportunities`;

  return (
    <div className="flex min-w-0 flex-row flex-nowrap items-center justify-between gap-2">
      <p className="min-w-0 truncate text-xs text-fg-muted sm:text-sm" aria-live="polite">
        {label}
      </p>
      <div className="relative inline-flex shrink-0 items-center">
        <ArrowDownWideNarrow
          size={19}
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 text-[var(--th-fg)]"
        />
        <select
          aria-label="Sort opportunities"
          value={sortOrder}
          onChange={(event) => onSortChange(event.target.value)}
          className="h-8 w-[116px] appearance-none rounded-md border border-[var(--th-line)] bg-[var(--th-panel)] pl-8 pr-7 text-xs font-medium text-[var(--th-fg)] shadow-sm outline-none transition-colors hover:border-[var(--th-accent)] focus-visible:border-[var(--th-accent)] focus-visible:ring-2 focus-visible:ring-[var(--th-accent)]/25 sm:h-9 sm:w-40 sm:rounded-lg sm:pl-9 sm:pr-9 sm:text-sm"
        >
          <option value="relevance">Relevance</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 text-[var(--th-fg-muted)] sm:right-3 sm:size-[15px]"
        />
      </div>
    </div>
  );
}
