import { CheckCircle2, Clock3 } from "lucide-react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

type Props = {
  appliedAt?: string | null;
  applicationLinkOpenedAt?: string | null;
};

export function JobActivityStatus({ appliedAt, applicationLinkOpenedAt }: Props) {
  if (appliedAt) {
    return <Chip color="success" icon={<CheckCircle2 size={15} />} label={`Applied ${new Date(appliedAt).toLocaleDateString()}`} />;
  }
  if (applicationLinkOpenedAt) {
    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Clock3 size={15} aria-hidden="true" />
        <Typography variant="caption" color="text.secondary">
          Application link opened {new Date(applicationLinkOpenedAt).toLocaleDateString()}
        </Typography>
      </Stack>
    );
  }
  return <Chip variant="outlined" label="Not applied yet" />;
}
