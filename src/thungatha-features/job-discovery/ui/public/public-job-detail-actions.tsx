import { Bookmark, ExternalLink, EyeOff, PanelsTopLeft } from "lucide-react";
import { Show, SignInButton } from "@clerk/nextjs";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
  configured: boolean; applyUrl: string | null; signInUrl: string; dismissed: boolean;
  onDismiss?: () => void; onRestore?: () => void; placement?: "header" | "primary";
};
function RestrictedAction({ configured, href, children }: {
  configured: boolean; href: string; children: React.ReactNode;
}) {
  const button = <Button variant="outlined" fullWidth>{children}</Button>;
  return configured ? <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1">{button}</SignInButton>
    : <Button component="a" href={href} variant="outlined" fullWidth>{children}</Button>;
}
function DismissAction({ configured, signInUrl, dismissed, onDismiss, onRestore }: Props) {
  if (dismissed) return <Button variant="outlined" onClick={onRestore}><EyeOff size={14} /> Restore</Button>;
  if (!configured) return <Button component="a" href={signInUrl} variant="outlined" color="warning"><EyeOff size={14} /> Dismiss</Button>;
  return <><Show when="signed-in"><Button variant="outlined" color="warning" onClick={onDismiss}><EyeOff size={14} /> Dismiss</Button></Show>
    <Show when="signed-out"><SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1"><Button variant="outlined" color="warning"><EyeOff size={14} /> Dismiss</Button></SignInButton></Show></>;
}
export function PublicJobDetailActions(props: Props) {
  const { configured, applyUrl, signInUrl, dismissed, onDismiss, onRestore, placement = "primary" } = props;
  if (placement === "header") return <Stack direction="row" spacing={1} className="th-jobs-detail-header-actions">
    <RestrictedAction configured={configured} href={signInUrl}><Bookmark size={15} /> Save</RestrictedAction>
    <DismissAction {...props} />
  </Stack>;
  return <Stack spacing={1} className="th-jobs-detail-actions th-jobs-redesign-actions">
    {applyUrl ? <Button component="a" href={applyUrl} target="_blank" rel="noopener noreferrer" variant="contained">Apply on company site <ExternalLink size={14} /></Button>
      : <Typography className="th-no-apply" variant="body2">An application link is not available for this listing yet.</Typography>}
    <RestrictedAction configured={configured} href={signInUrl}><PanelsTopLeft size={14} /> Tailor my CV</RestrictedAction>
  </Stack>;
}
