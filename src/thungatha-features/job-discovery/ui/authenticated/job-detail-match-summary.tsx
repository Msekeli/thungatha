import { Button } from "@/components/ui/button";

export function JobDetailMatchSummary({
  onViewMatch,
}: {
  onViewMatch: (anchor: HTMLElement) => void;
}) {
  return (
    <div className="th-jobs-match-scorebox hidden flex-col items-start gap-1 min-[601px]:flex">
      <span className="text-xs text-fg-muted">Match</span>
      <strong className="text-sm font-bold text-fg">Not calculated</strong>
      <Button
        variant="link"
        size="sm"
        className="h-auto px-0 text-accent-text"
        onClick={(event) => onViewMatch(event.currentTarget)}
      >
        Why is this unavailable?
      </Button>
    </div>
  );
}
