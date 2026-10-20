"use client";

import { useState } from "react";
import { UserRoundSearch } from "lucide-react";
import Button from "@mui/material/Button";
import { MatchBreakdownDialog } from "./match-breakdown-dialog";

export function JobMatchAvailability({
  label,
  variant = "text",
}: {
  label: string;
  variant?: "text" | "outlined";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant={variant}
        size="small"
        onClick={() => setOpen(true)}
        startIcon={<UserRoundSearch size={16} />}
      >
        {label}
      </Button>
      <MatchBreakdownDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
