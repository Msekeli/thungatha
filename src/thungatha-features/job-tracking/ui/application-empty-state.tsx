import { BriefcaseBusiness, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ApplicationEmptyState({ onRecord }: { onRecord: () => void }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <span className="mb-4 rounded-2xl bg-muted p-4 text-muted-foreground">
        <BriefcaseBusiness aria-hidden="true" className="size-7" />
      </span>
      <h2 className="text-lg font-semibold text-foreground">No applications yet</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Keep track of the roles you have applied for, interviews, follow-ups and outcomes.
        You can record applications made both on and off Thungatha.
      </p>
      <Button className="mt-6" onClick={onRecord}>
        <Plus data-icon="inline-start" />
        Record an application
      </Button>
    </div>
  );
}
