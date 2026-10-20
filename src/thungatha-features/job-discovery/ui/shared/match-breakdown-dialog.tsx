import Dialog from "@mui/material/Dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { open: boolean; onClose: () => void };

export function MatchBreakdownDialog({ open, onClose }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-label="Profile match breakdown"
      slotProps={{
        paper: {
          className: "th-jobs-popover th-jobs-match-popover th-jobs-mui-dialog",
          sx: {
            m: 1,
            width: "calc(100% - 16px)",
            maxHeight: "min(84dvh, 720px)",
            overflowY: "auto",
            border: "1px solid var(--th-line)",
            borderRadius: 3,
            bgcolor: "var(--th-panel)",
            color: "var(--th-fg)",
            boxShadow: "0 24px 64px rgba(0,0,0,.24)",
            "& > header": {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              px: { xs: 2, sm: 3 },
              py: 1.75,
              borderBottom: "1px solid var(--th-line)",
            },
            "& .th-jobs-match-placeholder": {
              p: { xs: 2, sm: 3 },
              "& h3": { mt: 0, mb: 1, fontSize: "1.1rem", fontWeight: 700 },
              "& p": { mt: 0, mb: 2, color: "var(--th-fg-muted)", lineHeight: 1.7 },
              "& ul": { pl: 2.5, mb: 0, color: "var(--th-fg-muted)", lineHeight: 1.9 },
            },
          },
        },
      }}
    >
      <header>
        <strong>Profile match breakdown</strong>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Close match breakdown"
          onClick={onClose}
        >
          <X size={16} />
        </Button>
      </header>
      <div className="th-jobs-match-placeholder">
        <h3>Job matching is coming soon</h3>
        <p>
          Matching requires a completed profile with your skills and experience.
          No score is calculated or implied. Complete your profile so it is
          ready when matching launches.
        </p>
        <ul>
          <li>Confirmed — evidence from your profile</li>
          <li>Inferred — possible match based on related experience</li>
          <li>Missing — not found in your profile</li>
          <li>Can’t verify — not enough information</li>
        </ul>
      </div>
    </Dialog>
  );
}
