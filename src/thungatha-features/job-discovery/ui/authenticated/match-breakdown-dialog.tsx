import Dialog from "@mui/material/Dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { open: boolean; onClose: () => void };

export function MatchBreakdownDialog({ open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      aria-label="Profile match breakdown"
      slotProps={{ paper: { className: "th-jobs-popover th-jobs-match-popover th-jobs-mui-dialog" } }}>
      <header>
        <strong>Profile match breakdown</strong>
        <Button variant="ghost" size="sm" aria-label="Close match breakdown" onClick={onClose}>
          <X size={16} />
        </Button>
      </header>
      <div className="th-jobs-match-placeholder">
        <h3>Match analysis is not available yet</h3>
        <p>When profile matching is implemented, this panel will compare the role requirements with your confirmed profile. No score is calculated at this checkpoint.</p>
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
