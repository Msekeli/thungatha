"use client";

import { ReactNode } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type JobDetailPanelProps = {
  title: string;
  employer?: string | null;
  location?: string | null;
  actions?: ReactNode;
  children?: ReactNode;
};

export function JobDetailPanel({
  title,
  employer,
  location,
  actions,
  children,
}: JobDetailPanelProps) {
  return (
    <Paper
      variant="outlined"
      sx={{ minWidth: 0, borderRadius: 3, p: { xs: 2, sm: 2.5 } }}
    >
      <Stack spacing={2}>
        <div>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {[employer?.trim(), location?.trim()].filter(Boolean).join(" · ") ||
              "Employer details not provided"}
          </Typography>
        </div>
        {actions && (
          <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
            {actions}
          </Stack>
        )}
        {children}
      </Stack>
    </Paper>
  );
}
