import { LogOut, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  isSigningOut: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function SignOutConfirmationDialog({
  isSigningOut,
  error,
  onClose,
  onConfirm,
}: Props) {
  return (
    <div
      className="th-signout-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSigningOut) onClose();
      }}
    >
      <section
        className="th-signout-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="th-signout-title"
        aria-describedby="th-signout-description"
      >
        <Button
          variant="ghost"
          size="sm"
          className="th-signout-close"
          type="button"
          aria-label="Close sign-out confirmation"
          disabled={isSigningOut}
          onClick={onClose}
        >
          <X size={18} />
        </Button>
        <span className="th-signout-icon" aria-hidden="true">
          <LogOut size={22} />
        </span>
        <h2 id="th-signout-title">Sign out of Thungatha?</h2>
        <p id="th-signout-description">
          You’ll be signed out of your account on this device. You can sign back
          in at any time.
        </p>
        {error ? (
          <p className="th-signout-error" role="alert">
            <ShieldCheck size={16} />
            {error}
          </p>
        ) : null}
        <div className="th-signout-actions">
          <Button
            variant="secondary"
            size="md"
            autoFocus
            disabled={isSigningOut}
            onClick={onClose}
          >
            Stay signed in
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={isSigningOut}
            onClick={onConfirm}
          >
            {isSigningOut ? "Signing out…" : "Yes, sign out"}
          </Button>
        </div>
      </section>
    </div>
  );
}
