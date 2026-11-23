import { Button } from "@/components/ui/button";

type MatchStatus = "no_assessment" | "processing" | "failed" | "stale" | "no_confirmed_profile" | "error" | "unavailable" | "match" | "relevant";

export function JobDetailMatchSummary({
  classification,
  status,
  onViewMatch,
}: {
  classification?: "match" | "relevant";
  status?: MatchStatus;
  onViewMatch: (anchor: HTMLElement) => void;
}) {
  const label = classification === "match"
    ? "Match"
    : classification === "relevant"
      ? "Relevant"
      : status === "processing"
        ? "Assessment pending"
        : status === "unavailable"
          ? "Assessment unavailable"
          : status === "failed"
            ? "Assessment needs retry"
            : null;

  if (!label) return null;

  return (
    <div className="th-jobs-match-scorebox hidden flex-col items-start gap-1 min-[601px]:flex">
      <span className="text-xs text-fg-muted">AI assessment</span>
      <strong className="text-sm font-bold text-fg">{label}</strong>
      <Button
        variant="link"
        size="sm"
        className="h-auto px-0 text-accent-text"
        onClick={(event) => onViewMatch(event.currentTarget)}
      >
        View assessment
      </Button>
    </div>
  );
}
