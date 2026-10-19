import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

export type JobActivityItem = {
  id: string;
  label: string;
  status: string;
  dateLabel?: string | null;
};

type Props = {
  items: JobActivityItem[];
  emptyMessage?: string;
};

export function JobActivityList({
  items,
  emptyMessage = "Your job activity will appear here.",
}: Props) {
  if (!items.length) {
    return <Typography variant="body2" color="text.secondary">{emptyMessage}</Typography>;
  }
  return (
    <Stack spacing={1.5}>
      {items.map((item) => (
        <Stack key={item.id} direction="row" alignItems="center" justifyContent="space-between" gap={2}>
          <Stack spacing={0}>
            <Typography variant="body2" fontWeight={600}>{item.label}</Typography>
            {item.dateLabel && <Typography variant="caption" color="text.secondary">{item.dateLabel}</Typography>}
          </Stack>
          <Chip size="small" label={item.status} variant="outlined" />
        </Stack>
      ))}
    </Stack>
  );
}
