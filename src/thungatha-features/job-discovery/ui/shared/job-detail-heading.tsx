import { ExternalLink } from "lucide-react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export function JobDetailHeading({
  title,
  employer,
  action,
}: {
  title: string;
  employer: string | null;
  action?: ReactNode;
}) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      className="th-jobs-redesign-job-head"
      sx={{
        alignItems: "center",
        minWidth: 0,
        pb: 1,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Avatar
        className="th-jobs-employer-mark th-jobs-detail-logo"
        sx={{
          width: 40,
          height: 40,
          flex: "0 0 40px",
          borderRadius: 1.5,
          bgcolor: "action.selected",
          color: "primary.main",
          fontSize: 1.125,
          fontWeight: 700,
        }}
      >
        {(employer?.trim() || title).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
      </Avatar>
      <Box
        className="th-jobs-redesign-title"
        sx={{
          flex: 1,
          minWidth: 0,
          "& h2": {
            mt: 0,
            mb: 0,
            fontSize: { xs: "1.0625rem", sm: "1.1875rem" },
            lineHeight: 1.25,
            overflowWrap: "anywhere",
          },
          "& p": { m: 0, fontSize: "0.75rem" },
        }}
      >
        <Typography variant="h5" component="h2">
          {title}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <Typography color="text.secondary">
            {employer?.trim() || "Employer not listed"}
          </Typography>
          <ExternalLink
            className="th-jobs-external-mark"
            size={13}
            aria-label="External employer link"
          />
        </Stack>
      </Box>
      {action}
    </Stack>
  );
}
