"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
};

export function JobFeedPagination({ page, totalPages, loading, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, Math.max(page + 2, 5));
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const btn = "inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-[var(--th-line)] px-2.5 text-xs font-medium text-[var(--th-fg)] transition-colors hover:bg-[var(--th-bg-muted)] disabled:pointer-events-none disabled:opacity-40 sm:h-9 sm:min-w-9 sm:px-3 sm:text-sm";
  const activeBtn = "inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-[var(--th-accent)] bg-[var(--th-accent)] px-2.5 text-xs font-semibold text-white sm:h-9 sm:min-w-9 sm:px-3 sm:text-sm";

  return (
    <nav aria-label="Job opportunities pagination" className="flex flex-wrap items-center justify-center gap-1.5 py-4 text-center sm:gap-2">
      <button type="button" aria-label="Go to previous page" disabled={page <= 1 || loading} onClick={() => onPageChange(page - 1)} className={btn}>
        <ChevronLeft size={16} aria-hidden="true" className="mr-1" />
        <span>Prev</span>
      </button>

      {start > 1 && (
        <>
          <button type="button" onClick={() => onPageChange(1)} className={btn} aria-label="Go to page 1">1</button>
          {start > 2 && <span className="px-1 text-xs text-[var(--th-fg-muted)]">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button key={p} type="button" aria-current={p === page ? "page" : undefined} aria-label={`Go to page ${p}`} disabled={loading} onClick={() => onPageChange(p)} className={p === page ? activeBtn : btn}>
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-xs text-[var(--th-fg-muted)]">…</span>}
          <button type="button" onClick={() => onPageChange(totalPages)} className={btn} aria-label={`Go to page ${totalPages}`}>{totalPages}</button>
        </>
      )}

      <button type="button" aria-label="Go to next page" disabled={page >= totalPages || loading} onClick={() => onPageChange(page + 1)} className={btn}>
        <span>Next</span>
        <ChevronRight size={16} aria-hidden="true" className="ml-1" />
      </button>
    </nav>
  );
}
