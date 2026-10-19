"use client";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
  page: number;
  pageCount: number;
  total: number;
  onChange: (page: number) => void;
};

export function PublicJobPagination({ page, pageCount, total, onChange }: Props) {
  if (pageCount < 2) return null;
  return (
    <Stack spacing={1} alignItems="center" className="py-4">
      <Pagination
        page={page}
        count={pageCount}
        onChange={(_, nextPage) => onChange(nextPage)}
        color="primary"
        shape="rounded"
      />
      <Typography variant="caption" color="text.secondary">
        {total.toLocaleString()} opportunities
      </Typography>
    </Stack>
  );
}
