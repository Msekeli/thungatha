import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import { ExternalLink } from "lucide-react";

type Props = {
  title: string;
  employer?: string | null;
  onViewMatch: () => void;
};

export function JobDetailHeading({ title, employer, onViewMatch }: Props) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ alignItems: "flex-start", minWidth: 0 }}
    >
      <Avatar
        variant="rounded"
        sx={{ width: 44, height: 44, bgcolor: "primary.main", fontWeight: 700 }}
      >
        {(employer?.trim() || "?").slice(0, 1).toUpperCase()}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 750, overflowWrap: "anywhere" }}
        >
          {title}
        </Typography>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: "center", flexWrap: "wrap" }}
        >
          <Typography variant="body2" color="text.secondary">
            {employer?.trim() || "Not provided"}
          </Typography>
          <ExternalLink size={13} aria-label="External employer link" />
          <Typography variant="caption" color="success.main">
            ✓ Verified company
          </Typography>
        </Stack>
      </Box>
      <Stack spacing={0.5} sx={{ alignItems: "flex-end", flexShrink: 0 }}>
        <Typography variant="caption" color="text.secondary">
          Match
        </Typography>
        <Typography variant="h6">—</Typography>
        <Button size="small" variant="text" onClick={onViewMatch}>
          View breakdown
        </Button>
      </Stack>
    </Stack>
  );
}
