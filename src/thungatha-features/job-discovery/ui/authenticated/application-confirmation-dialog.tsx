import Dialog from "@mui/material/Dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BriefcaseBusiness, X } from "lucide-react";

type Props = { open: boolean; busy: boolean; jobTitle: string; employer: string; onClose: () => void; onConfirm: () => void };

export function ApplicationConfirmationDialog({ open, busy, jobTitle, employer, onClose, onConfirm }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-label="Application confirmation"
      slotProps={{ paper: {
        className: "th-jobs-popover th-jobs-apply-popover th-jobs-mui-dialog",
        sx: {
          m: 1, width: "calc(100% - 16px)", maxHeight: "min(84dvh, 720px)", overflowY: "auto",
          border: "1px solid var(--th-line)", borderRadius: 3, bgcolor: "var(--th-panel)",
          color: "var(--th-fg)", boxShadow: "0 24px 64px rgba(0,0,0,.24)",
          "& > header": { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, px: { xs: 2, sm: 3 }, py: 1.75, borderBottom: "1px solid var(--th-line)" },
          "& .th-jobs-apply-confirm": {
            p: { xs: 2, sm: 3 },
            "& h3": { mt: 0, mb: 1, fontSize: "1.1rem", fontWeight: 700 },
            "& p": { mt: 0, mb: 2, color: "var(--th-fg-muted)", lineHeight: 1.7 },
            "& > div": { display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 1 },
            "& aside": { mt: 2.5, p: 1.5, borderRadius: 2, bgcolor: "var(--th-tag-bg)", color: "var(--th-fg-muted)", fontSize: 13, lineHeight: 1.6 },
          },
        },
      }}}>
      <header>
        <span className="th-jobs-popover-icon"><BriefcaseBusiness size={19} /></span>
        <Button variant="ghost" size="sm" aria-label="Close application confirmation" onClick={onClose}><X size={16} /></Button>
      </header>
      <div className="th-jobs-apply-confirm">
        <h3>Did you apply?</h3>
        <p>You have opened the application page for <strong>{jobTitle}</strong> at <strong>{employer}</strong>.</p>
        <div>
          <Button variant="secondary" disabled={busy} onClick={onClose}>Not yet</Button>
          <Button variant="primary" disabled={busy} onClick={onConfirm}>{busy ? "Saving…" : "Yes, I applied"}</Button>
        </div>
        <aside><span aria-hidden="true">ⓘ</span> This will be recorded in your <Link href="/tracking">Job Tracking</Link> so you can keep track of your applications.</aside>
      </div>
    </Dialog>
  );
}
