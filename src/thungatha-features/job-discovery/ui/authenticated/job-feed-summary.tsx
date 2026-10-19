import { BookmarkCheck, BriefcaseBusiness, EyeOff } from "lucide-react";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

type Props = {
  total: number;
  saved: number;
  hidden: number;
};

export function JobFeedSummary({ total, saved, hidden }: Props) {
  const items = [
    { label: "Available jobs", value: total, icon: BriefcaseBusiness },
    { label: "Saved", value: saved, icon: BookmarkCheck },
    { label: "Hidden", value: hidden, icon: EyeOff },
  ];
  return (
    <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
      {items.map(({ label, value, icon: Icon }) => (
        <Paper key={label} variant="outlined" className="flex min-w-[120px] flex-1 items-center gap-3 rounded-xl p-3">
          <Icon size={18} aria-hidden="true" />
          <Stack spacing={0}>
            <Typography variant="h6" fontWeight={700}>{value.toLocaleString()}</Typography>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
