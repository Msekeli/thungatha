import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export function JobDetailStatus({
  activityError,
  detailError,
  applicationUrl,
  onRetry,
}: {
  activityError: string | null;
  detailError: string | null;
  applicationUrl: string | null;
  onRetry: () => void;
}) {
  return (
    <>
      {activityError && (
        <Typography color="error" variant="body2" role="status">
          {activityError}
        </Typography>
      )}
      {detailError && (
        <Stack
          direction="row"
          spacing={1}
          role="status"
          sx={{ alignItems: "center" }}
        >
          <Typography color="error" variant="body2">
            {detailError}
          </Typography>
          <Button variant="outlined" size="small" onClick={onRetry}>
            Retry
          </Button>
        </Stack>
      )}
      <Box className="th-jobs-source-status">
        <Typography
          component="span"
          variant="caption"
          data-available={Boolean(applicationUrl)}
        >
          {applicationUrl
            ? "✓ Application destination available"
            : "! Employer application link not verified"}
        </Typography>
      </Box>
    </>
  );
}
