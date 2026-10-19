import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
  title?: string;
  description?: string;
  greeting?: string | null;
};

export function JobFeedHeader({
  title = "Discover jobs",
  description = "Find opportunities and keep track of the roles that interest you.",
  greeting,
}: Props) {
  return (
    <Stack spacing={1} className="min-w-0">
      {greeting && <Typography variant="body2" color="text.secondary">{greeting}</Typography>}
      <Typography component="h1" variant="h4" fontWeight={750}>{title}</Typography>
      <Typography color="text.secondary" variant="body2">{description}</Typography>
    </Stack>
  );
}
