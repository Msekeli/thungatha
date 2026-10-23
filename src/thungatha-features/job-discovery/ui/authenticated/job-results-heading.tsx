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
    <div className="flex flex-row flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-fg-muted" aria-live="polite">
        {label}
      </p>
      <div className="relative inline-flex shrink-0 items-center">
        <ArrowDownWideNarrow
          size={15}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 text-[var(--th-muted)]"
        />
        <select
          aria-label="Sort opportunities"
          value={sortOrder}
          onChange={(event) => onSortChange(event.target.value)}
          className="h-9 w-40 appearance-none rounded-lg border border-[var(--th-line)] bg-[var(--th-panel)] pl-8 pr-9 text-sm font-medium text-[var(--th-fg)] shadow-sm outline-none transition-colors hover:border-[var(--th-accent)] focus-visible:border-[var(--th-accent)] focus-visible:ring-2 focus-visible:ring-[var(--th-accent)]/25"
        >
          <option value="relevance">Relevance</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        <ChevronDown
          size={15}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 text-[var(--th-muted)]"
        />
      </div>
    </div>
  );
}
