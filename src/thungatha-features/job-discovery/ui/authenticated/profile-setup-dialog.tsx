import Dialog from "@mui/material/Dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreateProfile: () => void;
};

export function ProfileSetupDialog({ open, onClose, onCreateProfile }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-label="Set up your job profile"
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
            },
            "& .th-jobs-prompt-actions": {
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              gap: 1,
              mt: 2,
            },
          },
        },
      }}
    >
      <header>
        <strong>Get better job matches</strong>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Dismiss profile setup"
          onClick={onClose}
        >
          <X size={16} />
        </Button>
      </header>
      <div className="th-jobs-match-placeholder">
        <h3>Set up your profile</h3>
        <p>
          Add your experience, skills and career preferences so Thungatha can
          help you find relevant opportunities and prepare your CV for each
          role.
        </p>
        <div className="th-jobs-prompt-actions">
          <Button variant="secondary" onClick={onClose}>
            Do this later
          </Button>
          <Button variant="primary" onClick={onCreateProfile}>
            Create my profile
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
