import { Bookmark, ExternalLink, EyeOff, PanelsTopLeft } from "lucide-react";
import { Show, SignInButton } from "@clerk/nextjs";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
  configured: boolean; applyUrl: string | null; signInUrl: string; dismissed: boolean;
  onDismiss?: () => void; onRestore?: () => void;
};
function RestrictedAction({ configured, href, children }: {
  configured: boolean; href: string; children: React.ReactNode;
}) {
  const button = <Button variant="outlined" fullWidth>{children}</Button>;
  return configured ? <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1">{button}</SignInButton>
    : <Button component="a" href={href} variant="outlined" fullWidth>{children}</Button>;
}
export function PublicJobDetailActions({
  configured, applyUrl, signInUrl, dismissed, onDismiss, onRestore,
}: Props) {
  return <Stack spacing={1} className="th-jobs-detail-actions th-jobs-redesign-actions">
    {applyUrl ? <Button component="a" href={applyUrl} target="_blank" rel="noopener noreferrer" variant="contained">
      Apply on company site <ExternalLink size={14} />
    </Button> : <Typography className="th-no-apply" variant="body2">An application link is not available for this listing yet.</Typography>}
    <RestrictedAction configured={configured} href={signInUrl}><PanelsTopLeft size={14} /> Tailor my CV</RestrictedAction>
    <RestrictedAction configured={configured} href={signInUrl}><Bookmark size={14} /> Save</RestrictedAction>
    {dismissed ? <Button variant="outlined" onClick={onRestore} fullWidth><EyeOff size={14} /> Restore job</Button> :
      configured ? <><Show when="signed-in"><Button variant="outlined" color="warning" onClick={onDismiss} fullWidth><EyeOff size={14} /> Dismiss</Button></Show>
        <Show when="signed-out"><SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1"><Button variant="outlined" color="warning" fullWidth><EyeOff size={14} /> Dismiss</Button></SignInButton></Show></> :
      <Button component="a" href={signInUrl} variant="outlined" color="warning" fullWidth><EyeOff size={14} /> Dismiss</Button>}
  </Stack>;
}
