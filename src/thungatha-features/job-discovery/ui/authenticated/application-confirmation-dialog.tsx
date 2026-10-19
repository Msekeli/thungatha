import Dialog from "@mui/material/Dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BriefcaseBusiness } from "lucide-react";

type Props = {
  open: boolean;
  busy: boolean;
  jobTitle: string;
  employer: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function ApplicationConfirmationDialog({
  open, busy, jobTitle, employer, onClose, onConfirm,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      aria-label="Application confirmation"
      slotProps={{ paper: { className: "th-jobs-popover th-jobs-apply-popover th-jobs-mui-dialog" } }}>
      <header>
        <span className="th-jobs-popover-icon"><BriefcaseBusiness size={19} /></span>
        <Button variant="ghost" size="sm" aria-label="Close application confirmation" onClick={onClose}>×</Button>
      </header>
      <div className="th-jobs-apply-confirm">
        <h3>Did you apply?</h3>
        <p>You have opened the application page for <strong>{jobTitle}</strong> at <strong>{employer}</strong>.</p>
        <div>
          <Button variant="secondary" disabled={busy} onClick={onClose}>Not yet</Button>
          <Button variant="primary" disabled={busy} onClick={onConfirm}>
            {busy ? "Saving…" : "Yes, I applied"}
          </Button>
        </div>
        <aside><span aria-hidden="true">ⓘ</span> This will be recorded in your <Link href="/tracking">Job Tracking</Link> so you can keep track of your applications.</aside>
      </div>
    </Dialog>
  );
}
