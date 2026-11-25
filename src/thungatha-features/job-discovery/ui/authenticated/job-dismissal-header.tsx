import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function JobDismissalHeader({
  busy,
  onClose,
}: {
  busy: boolean;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="m-0 text-base font-semibold">
          What would you like to dismiss?
        </h2>
        <p className="mb-0 mt-1 text-sm leading-5 text-fg-muted">
          Select one option. You can review it before confirming.
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Close dismissal options"
        disabled={busy}
        onClick={onClose}
      >
        <X size={16} />
      </Button>
    </div>
  );
}
