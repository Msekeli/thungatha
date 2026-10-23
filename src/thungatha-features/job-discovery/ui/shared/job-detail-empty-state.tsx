import type { ReactNode } from "react";
import { BriefcaseBusiness } from "lucide-react";

export function JobDetailEmptyState({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-1 py-[30px] text-center text-sm text-fg-muted [&>p]:m-0 [&>p]:leading-relaxed">
      <BriefcaseBusiness
        className="size-6 text-accent-text"
        aria-hidden="true"
      />
      <strong className="text-base font-semibold text-fg">
        Select an opportunity
      </strong>
      <p>
        Choose a listing to view its description and application destination.
      </p>
      {children}
    </div>
  );
}
