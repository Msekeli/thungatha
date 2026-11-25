import { Button } from "@/components/ui/button";

export function CvStudioExternalJobFormHeader({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">
          External opportunity
        </p>
        <h2 className="mt-1 text-xl font-semibold text-fg">Add job details</h2>
        <p className="mt-2 text-sm leading-6 text-fg-muted">
          Enter the job title and company, then paste the full job description.
        </p>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onClose}>
        Cancel
      </Button>
    </div>
  );
}
