import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
  title?: string;
  description?: string;
  opportunityCount?: number | null;
};

export function PublicJobHero({
  title = "Find your next opportunity",
  description = "Discover roles that match your skills and career goals.",
  opportunityCount,
}: Props) {
  return (
    <Stack spacing={1} className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      <Typography component="h1" variant="h3" fontWeight={750}>
        {title}
      </Typography>
      <Typography color="text.secondary" variant="body1" maxWidth="680px">
        {description}
      </Typography>
      {opportunityCount != null && (
        <Typography variant="body2" color="text.secondary">
          Explore {opportunityCount.toLocaleString()} opportunities
        </Typography>
      )}
    </Stack>
  );
}
