import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
  onSignIn: () => void;
  title?: string;
  description?: string;
};

export function PublicJobGuestCta({
  onSignIn,
  title = "Keep your job search organised",
  description = "Sign in to save opportunities and manage your applications.",
}: Props) {
  return (
    <Paper variant="outlined" className="rounded-xl p-4 sm:p-5">
      <Stack spacing={1.5} alignItems="flex-start">
        <Typography variant="h6" component="h2">{title}</Typography>
        <Typography variant="body2" color="text.secondary">{description}</Typography>
        <Button variant="contained" onClick={onSignIn}>Sign in</Button>
      </Stack>
    </Paper>
  );
}
