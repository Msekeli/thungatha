"use client";

import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { BriefcaseBusiness } from "lucide-react";

type Props = {
  error?: string | null;
  loading: boolean;
  resultCount: number;
  onRetry?: () => void;
  showStatus?: boolean;
  showLoading?: boolean;
};

export function PublicJobDiscoveryResultState({ error, loading, resultCount, onRetry, showStatus, showLoading }: Props) {
  if (showStatus && error) {
    return <Alert severity="error" action={<Button color="inherit" size="small" onClick={onRetry}>Try again</Button>}>{error}</Alert>;
  }
  if (showStatus && !loading && resultCount === 0) {
    return (
      <Stack spacing={1.5} sx={{ alignItems: "center", py: 5, px: 2, textAlign: "center" }}>
        <BriefcaseBusiness size={28} aria-hidden="true" />
        <Typography variant="h6">No matching jobs yet</Typography>
        <Typography variant="body2" color="text.secondary">Try changing your filters or search terms.</Typography>
      </Stack>
    );
  }
  if (showLoading && loading) {
    return <Box role="status" aria-label="Loading jobs" sx={{ display: "flex", justifyContent: "center", py: 5 }}><CircularProgress size={28} /></Box>;
  }
  return null;
}
