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
