import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export function JobResultsHeading({
  loading,
  count,
  total,
  sortOrder,
  onSortChange,
}: {
  loading: boolean;
  count: number;
  total: number;
  sortOrder: string;
  onSortChange: (value: string) => void;
}) {
  const label = loading
    ? "Updating opportunities…"
    : count === 0
      ? "0 opportunities"
      : `1–${Math.min(count, total).toLocaleString()} of ${total.toLocaleString()} opportunities`;

  return (
    <Stack
      component="div"
      direction="row"
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1,
        px: 2,
        py: 1.5,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Typography variant="body2" color="text.secondary" aria-live="polite">
        {label}
      </Typography>
      <select
        aria-label="Sort opportunities"
        value={sortOrder}
        onChange={(event) => onSortChange(event.target.value)}
        className="h-9 w-36 shrink-0 rounded-full border border-[var(--th-line)] bg-[var(--th-panel)] px-3 text-sm text-[var(--th-fg)] outline-none focus-visible:border-[var(--th-accent)]"
      >
        <option value="newest">Sort: Newest</option>
        <option value="oldest">Sort: Oldest</option>
      </select>
    </Stack>
  );
}
