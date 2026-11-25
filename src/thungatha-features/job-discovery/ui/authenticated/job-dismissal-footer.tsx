import { Button } from "@/components/ui/button";
import type { DismissalScope } from "./job-dismissal-option";

export function JobDismissalFooter({
  activeScope,
  busy,
  onClose,
  onConfirm,
}: {
  activeScope: DismissalScope | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: (scope: DismissalScope) => void;
}) {
  return (
    <div className="mt-4 flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={onClose}
      >
        Cancel
      </Button>
      <Button
        size="sm"
        disabled={busy || !activeScope}
        onClick={() => activeScope && onConfirm(activeScope)}
      >
        {busy ? "Dismissing…" : "Confirm dismissal"}
      </Button>
    </div>
  );
}
