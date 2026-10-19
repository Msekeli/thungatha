import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { title: string; employer?: string | null; onViewMatch: () => void };

export function JobDetailHeading({ title, employer, onViewMatch }: Props) {
  return (
    <div className="th-jobs-redesign-job-head">
      <span className="th-jobs-employer-mark th-jobs-detail-logo">{(employer?.trim() || "?").slice(0, 1).toUpperCase()}</span>
      <div className="th-jobs-redesign-title">
        <h2>{title}</h2>
        <p>{employer?.trim() || "Not provided"} <ExternalLink className="th-jobs-external-mark" size={13} aria-label="External employer link" /> <span className="th-jobs-verified">✓ Verified company</span></p>
      </div>
      <div className="th-jobs-match-scorebox">
        <span>Match</span><strong>—</strong>
        <Button variant="ghost" size="sm" onClick={onViewMatch}>View breakdown</Button>
      </div>
    </div>
  );
}
