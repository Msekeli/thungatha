import { Button } from "@/components/ui/button";

export function JobDetailMatchSummary({
  classification,
  onViewMatch,
}: {
  classification?: "match" | "relevant" | "unclassified";
  onViewMatch: (anchor: HTMLElement) => void;
}) {
  if (classification !== "match" && classification !== "relevant") return null;
  const label = classification === "match" ? "Match" : "Relevant";

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
