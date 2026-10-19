import type { ReactNode } from "react";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";

type Props = {
  search: ReactNode;
  results: ReactNode;
  detail?: ReactNode;
};

export function PublicJobFeedShell({ search, results, detail }: Props) {
  return (
    <Stack spacing={2} className="mx-auto w-full max-w-6xl px-4 pb-10">
      {search}
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
        <Paper variant="outlined" className="min-w-0 rounded-xl p-3 sm:p-4">
          {results}
        </Paper>
        {detail && (
          <Paper variant="outlined" className="min-w-0 rounded-xl p-4 sm:p-5">
            {detail}
          </Paper>
        )}
      </div>
    </Stack>
  );
}
