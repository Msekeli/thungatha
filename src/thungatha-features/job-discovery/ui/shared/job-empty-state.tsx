import { SearchX } from "lucide-react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import type { ReactNode } from "react";

type Props = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  presentation?: "card" | "minimal";
  icon?: ReactNode;
};

export function JobEmptyState({
  title,
  message,
  actionLabel,
  onAction,
  presentation = "card",
  icon,
}: Props) {
  return (
    <Stack
      spacing={1.5}
      sx={{
        alignItems: "center",
        textAlign: "center",
        ...(presentation === "card"
          ? { border: 1, borderColor: "divider", borderRadius: 3, p: 4 }
          : { py: 5, px: 2 }),
      }}
    >
      {icon ?? <SearchX size={28} aria-hidden="true" />}
      <Typography variant="h6" component="h3">
        {title}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        {message}
      </Typography>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outlined">
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}
