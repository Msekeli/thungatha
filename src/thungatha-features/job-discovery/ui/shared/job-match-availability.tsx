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
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  return (
    <>
      <Button
        variant={variant}
        size="small"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        startIcon={<UserRoundSearch size={16} />}
      >
        {label}
      </Button>
      <MatchBreakdownDialog
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      />
    </>
  );
}
