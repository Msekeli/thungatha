"use client";

import { Bookmark, EyeOff } from "lucide-react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

type Props = {
  saved: boolean;
  onToggleSaved: () => void;
  onDismiss: () => void;
  disabled?: boolean;
};

export function JobStateActions({ saved, onToggleSaved, onDismiss, disabled }: Props) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      <Button
        variant={saved ? "contained" : "outlined"}
        disabled={disabled}
        onClick={onToggleSaved}
        startIcon={<Bookmark size={16} />}
      >
        {saved ? "Saved" : "Save job"}
      </Button>
      <Button
        variant="outlined"
        color="inherit"
        disabled={disabled}
        onClick={onDismiss}
        startIcon={<EyeOff size={16} />}
      >
        Hide job
      </Button>
    </Stack>
  );
}
