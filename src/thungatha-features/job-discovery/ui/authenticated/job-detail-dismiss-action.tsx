import { Button } from "@/components/ui/button";
import { EyeOff } from "lucide-react";
import { ProtectedDiscoveryAction } from "../shared/protected-discovery-action";
import { JobDetailOverflowMenu } from "./job-detail-overflow-menu";

export function JobDetailDismissAction({
  configured,
  disabled,
  dismissed,
  onDismiss,
}: {
  configured: boolean;
  disabled: boolean;
  dismissed: boolean;
  onDismiss: () => void;
}) {
  return (
    <>
      <ProtectedDiscoveryAction
        configured={configured}
        title="Personalise your job feed"
        description="Sign in or create a free account to dismiss jobs you are not interested in."
        onAction={onDismiss}
      >
        <Button
          variant="warning"
          className="th-job-detail-action-button hidden min-[601px]:inline-flex"
          disabled={disabled}
        >
          {!dismissed && <EyeOff size={14} aria-hidden="true" />}
          {dismissed ? "Restore" : "Dismiss"}
        </Button>
      </ProtectedDiscoveryAction>
      <div className="min-[601px]:hidden">
        <JobDetailOverflowMenu
          configured={configured}
          disabled={disabled}
          dismissed={dismissed}
          onDismiss={onDismiss}
        />
      </div>
    </>
  );
}
