import Link from "next/link";
import { Toast } from "@/components/ui/toast";
import { JobUndoNotice } from "./job-undo-notice";

export type JobUndoAction = {
  jobId: string;
  title: string;
  previousState: "saved" | "dismissed" | null;
  nextState: "saved" | "dismissed" | null;
} | null;

type Props = {
  isAuthenticated: boolean;
  undoAction: JobUndoAction;
  stateBusy: boolean;
  onUndo: () => void;
  onDismissUndo: () => void;
  stateMessage: string | null;
  onDismissMessage: () => void;
  stateError: string | null;
  onDismissError: () => void;
};

export function JobDiscoveryFeedback(props: Props) {
  return (
    <>
      {!props.isAuthenticated && (
        <div className="th-jobs-auth-notice" role="status">
          <p>Your session has expired. Sign in again to browse job listings.</p>
          <Link href="/sign-in">Go to sign in</Link>
        </div>
      )}
      {props.undoAction && (
        <JobUndoNotice
          action={props.undoAction}
          busy={props.stateBusy}
          onUndo={props.onUndo}
          onDismiss={props.onDismissUndo}
        />
      )}
      {props.stateMessage && !props.undoAction && (
        <Toast
          message={props.stateMessage}
          tone="success"
          onDismiss={props.onDismissMessage}
        />
      )}
      {props.stateError && (
        <Toast
          message={props.stateError}
          tone="error"
          onDismiss={props.onDismissError}
        />
      )}
    </>
  );
}
