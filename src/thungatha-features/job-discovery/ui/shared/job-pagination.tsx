"use client";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
  page: number;
  pageCount: number;
  total: number;
  onChange: (page: number) => void;
  summary?: string;
};

export function JobPagination({
  page,
  pageCount,
  total,
  onChange,
  summary = "opportunities",
}: Props) {
  if (pageCount < 2) return null;
  return (
    <Stack spacing={1} className="py-4" sx={{ alignItems: "center" }}>
      <Pagination
        page={page}
        count={pageCount}
        onChange={(_, nextPage) => onChange(nextPage)}
        color="primary"
        shape="rounded"
      />
      <Typography variant="caption" color="text.secondary">
        {total.toLocaleString()} {summary}
      </Typography>
    </Stack>
  );
}
