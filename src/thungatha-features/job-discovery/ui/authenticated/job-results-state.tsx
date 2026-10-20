import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { Button } from "@/components/ui/button";

type Props = {
  loading: boolean;
  hasFeed: boolean;
  error: string | null;
  hasJobs: boolean;
  hasFilters: boolean;
  onRetry: () => void;
};

const stateSx = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "flex-start",
  gap: 1.25,
  p: "28px 8px",
  color: "text.secondary",
  fontSize: 12,
};

export function JobResultsState({
  loading,
  hasFeed,
  error,
  hasJobs,
  hasFilters,
  onRetry,
}: Props) {
  if (loading && !hasFeed)
    return (
      <Box role="status" sx={stateSx}>
        <CircularProgress size={20} aria-label="Loading opportunities" />
        <Typography
          component="strong"
          sx={{ color: "text.primary", fontSize: 13, fontWeight: 600 }}
        >
          Loading opportunities
        </Typography>
      </Box>
    );
  if (error)
    return (
      <Box role="alert" sx={stateSx}>
        <Typography
          component="strong"
          sx={{ color: "text.primary", fontSize: 13, fontWeight: 600 }}
        >
          We couldn’t load opportunities
        </Typography>
        <Typography component="p" sx={{ m: 0, mb: 0.5, lineHeight: 1.6 }}>
          {error}
        </Typography>
        <Button onClick={onRetry}>Retry</Button>
      </Box>
    );
  if (hasJobs) return null;
  return (
    <Box sx={stateSx}>
      <Typography
        component="strong"
        sx={{ color: "text.primary", fontSize: 13, fontWeight: 600 }}
      >
        {hasFilters
          ? "No opportunities match these filters"
          : "No active opportunities available"}
      </Typography>
      <Typography component="p" sx={{ m: 0, mb: 0.5, lineHeight: 1.6 }}>
        Try changing your search or filters.
      </Typography>
    </Box>
  );
}
