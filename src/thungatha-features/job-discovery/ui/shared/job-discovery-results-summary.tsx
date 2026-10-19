import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
  label: string;
  secondary?: string;
};

export function JobDiscoveryResultsSummary({ label, secondary }: Props) {
  return (
    <Stack
      component="div"
      direction="row"
      sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}
    >
      <Typography variant="body2" color="text.secondary" aria-live="polite">
        {label}
      </Typography>
      {secondary && (
        <Typography variant="caption" color="text.secondary">
          {secondary}
        </Typography>
      )}
    </Stack>
  );
}
