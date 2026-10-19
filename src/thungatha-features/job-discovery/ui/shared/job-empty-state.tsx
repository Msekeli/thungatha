import { SearchX } from "lucide-react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

type Props = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function JobEmptyState({ title, message, actionLabel, onAction }: Props) {
  return (
    <Stack alignItems="center" textAlign="center" spacing={1.5} sx={{ border: 1, borderColor: "divider", borderRadius: 3, p: 4 }}>
      <SearchX size={28} aria-hidden="true" />
      <Typography variant="h6" component="h3">{title}</Typography>
      <Typography color="text.secondary" variant="body2">{message}</Typography>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outlined">{actionLabel}</Button>
      )}
    </Stack>
  );
}
