"use client";
import { Bookmark, ExternalLink, EyeOff, PanelsTopLeft } from "lucide-react";
import { Show } from "@clerk/nextjs";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PublicAuthPrompt } from "./public-auth-prompt";

type Props = {
  configured: boolean;
  applyUrl: string | null;
  signInUrl: string;
  dismissed: boolean;
  onDismiss?: () => void;
  onRestore?: () => void;
  placement?: "header" | "primary";
};
function RestrictedAction({
  configured,
  children,
  title,
  description,
}: {
  configured: boolean;
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <PublicAuthPrompt configured={configured} title={title} description={description}>
      <Button variant="outlined" className="th-restricted-action">
        {children}
      </Button>
    </PublicAuthPrompt>
  );
}
function DismissAction({
  configured,
  dismissed,
  onDismiss,
  onRestore,
}: Props) {
  if (dismissed)
    return (
      <Button variant="outlined" onClick={onRestore}>
        <EyeOff size={14} /> Restore
      </Button>
    );
  if (!configured)
    return (
      <PublicAuthPrompt
        configured={false}
        title="Personalise your job feed"
        description="Sign in or create a free account to dismiss jobs you are not interested in."
      >
        <Button variant="outlined" color="warning">
          <EyeOff size={14} /> Dismiss
        </Button>
      </PublicAuthPrompt>
    );
  return (
    <>
      <Show when="signed-in">
        <Button variant="outlined" color="warning" onClick={onDismiss}>
          <EyeOff size={14} /> Dismiss
        </Button>
      </Show>
      <Show when="signed-out">
        <PublicAuthPrompt
          configured
          title="Personalise your job feed"
          description="Sign in or create a free account to dismiss jobs you are not interested in."
        >
          <Button variant="outlined" color="warning">
            <EyeOff size={14} /> Dismiss
          </Button>
        </PublicAuthPrompt>
      </Show>
    </>
  );
}
export function PublicJobDetailActions(props: Props) {
  const { configured, applyUrl, placement = "primary" } = props;
  if (placement === "header")
    return (
      <Stack
        direction="row"
        spacing={1}
        className="th-jobs-detail-header-actions"
      >
        <RestrictedAction
          configured={configured}
          title="Save this opportunity"
          description="Sign in or create a free account to save this job and return to it later."
        >
          <Bookmark size={15} /> Save
        </RestrictedAction>
        <DismissAction {...props} />
      </Stack>
    );
  return (
    <Stack
      spacing={1}
      className="th-jobs-detail-actions th-jobs-redesign-actions"
    >
      {applyUrl ? (
        <Button
          component="a"
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
        >
          Apply Now <ExternalLink size={14} />
        </Button>
      ) : (
        <Typography className="th-no-apply" variant="body2">
          An application link is not available for this listing yet.
        </Typography>
      )}
      <RestrictedAction
        configured={configured}
        title="Tailor your CV"
        description="Sign in or create a free account to tailor your CV to this opportunity."
      >
        <PanelsTopLeft size={14} /> Tailor my CV
      </RestrictedAction>
    </Stack>
  );
}
