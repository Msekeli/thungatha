"use client";

import type { ReactNode } from "react";
import { AlertCircle, ChevronDown, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProfileAccordion({
  title, description, status, children, onSave, saving = false,
}: {
  title: string; description?: string; status: string; children: ReactNode;
  onSave: () => void; saving?: boolean;
}) {
  const incomplete = status === "Incomplete";
  return (
    <details name="thungatha-profile-sections" className="th-profile-accordion group">
      <summary className="th-profile-accordion-trigger">
        <span className="th-profile-accordion-copy">
          <span className="th-profile-accordion-title">{title}</span>
          {description && <span className="th-profile-accordion-description">{description}</span>}
        </span>
        <span className="th-profile-accordion-meta">
          <span className={incomplete ? "th-profile-accordion-status text-amber-600 dark:text-amber-400" : "th-profile-accordion-status"}>
            {incomplete && <AlertCircle aria-hidden="true" className="mr-1 inline size-3.5" />}
            {status}
          </span>
          <ChevronDown aria-hidden="true" className="th-profile-accordion-chevron" size={18} />
        </span>
      </summary>
      <div className="th-profile-accordion-panel">
        {children}
        {incomplete && <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">Some education details are missing. Complete the highlighted fields before reviewing your profile.</p>}
        <div className="mt-4 flex justify-end border-t border-border pt-3">
          <Button type="button" size="sm" onClick={() => onSave()} disabled={saving}>
            <Save className="size-4" />{saving ? "Saving…" : "Save section"}
          </Button>
        </div>
      </div>
    </details>
  );
}
