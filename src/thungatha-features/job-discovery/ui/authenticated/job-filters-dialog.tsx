"use client";

import { AnchoredPopover } from "@/components/ui/anchored-popover";
import { JobFiltersDialogContent } from "./job-filters-dialog-content";

export type JobFiltersDraft = {
  query: string;
  location: string;
  workMode: string;
  employmentType: string;
  publishedWithin: string;
};

type Props = {
  open: boolean;
  anchorEl: HTMLElement | null;
  draft: JobFiltersDraft;
  onClose: () => void;
  onChange: (key: keyof JobFiltersDraft, value: string) => void;
  onReset: () => void;
  onApply: () => void;
};

export function JobFiltersDialog({
  open,
  anchorEl,
  draft,
  onClose,
  onChange,
  onReset,
  onApply,
}: Props) {
  return (
    <AnchoredPopover
      open={open}
      anchor={anchorEl}
      onClose={onClose}
      label="Filter opportunities"
      className="th-jobs-filter-dialog box-border max-h-[min(78dvh,620px)] w-[min(340px,calc(100vw-24px))] overflow-y-auto rounded-panel border border-line bg-panel p-3 text-fg shadow-xl sm:p-4"
    >
      <JobFiltersDialogContent
        draft={draft}
        onClose={onClose}
        onChange={onChange}
        onReset={onReset}
        onApply={onApply}
      />
    </AnchoredPopover>
  );
}
