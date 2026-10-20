"use client";

import { Alert, Box, Button, CircularProgress } from "@mui/material";
import { BriefcaseBusiness } from "lucide-react";
import { JobEmptyState } from "../shared/job-empty-state";

type Props = {
  error?: string | null;
  loading: boolean;
  resultCount: number;
  onRetry?: () => void;
  showStatus?: boolean;
  showLoading?: boolean;
};

export function PublicJobDiscoveryResultState({
  error,
  loading,
  resultCount,
  onRetry,
  showStatus,
  showLoading,
}: Props) {
  if (showStatus && error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={onRetry}>
            Try again
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }
  if (showStatus && !loading && resultCount === 0) {
    return (
      <JobEmptyState
        presentation="minimal"
        icon={<BriefcaseBusiness size={28} aria-hidden="true" />}
        title="No matching jobs yet"
        message="Try changing your filters or search terms."
      />
    );
  }
  if (showLoading && loading) {
    return (
      <Box
        role="status"
        aria-label="Loading jobs"
        sx={{ display: "flex", justifyContent: "center", py: 5 }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }
  return null;
}
