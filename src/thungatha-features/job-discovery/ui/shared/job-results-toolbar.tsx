"use client";

import { ArrowDownUp, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type JobResultsToolbarProps = {
  total: number;
  page: number;
  pageSize: number;
  sortOrder: string;
  onSortChange: (value: string) => void;
  onOpenFilters?: () => void;
};

export function JobResultsToolbar({
  total, page, pageSize, sortOrder, onSortChange, onOpenFilters,
}: JobResultsToolbarProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
      <Typography variant="body2">{start}–{end} of {total} opportunities</Typography>
      <Stack direction="row" spacing={1}>
        {onOpenFilters && (
          <Button variant="secondary" onClick={onOpenFilters}>
            <SlidersHorizontal size={15} /> Filters
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={() => onSortChange(sortOrder === "newest" ? "oldest" : "newest")}
          aria-label="Change job sort order"
        >
          <ArrowDownUp size={15} /> {sortOrder === "newest" ? "Newest" : "Oldest"}
        </Button>
      </Stack>
    </Stack>
  );
}
