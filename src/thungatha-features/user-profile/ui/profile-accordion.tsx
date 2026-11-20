"use client";

import type { ReactNode } from "react";
import { ChevronDown, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProfileAccordion({
  title,
  description,
  status,
  children,
  onSave,
  saving = false,
}: {
  title: string;
  description?: string;
  status: string;
  children: ReactNode;
  onSave: () => void;
  saving?: boolean;
}) {
  return (
    <details
      name="thungatha-profile-sections"
      className="th-profile-accordion group"
    >
      <summary className="th-profile-accordion-trigger">
        <span className="th-profile-accordion-copy">
          <span className="th-profile-accordion-title">{title}</span>
          {description && (
            <span className="th-profile-accordion-description">
              {description}
            </span>
          )}
        </span>
        <span className="th-profile-accordion-meta">
          <span className="th-profile-accordion-status">{status}</span>
          <ChevronDown
            aria-hidden="true"
            className="th-profile-accordion-chevron"
            size={18}
          />
        </span>
      </summary>
      <div className="th-profile-accordion-panel">{children}<div className="mt-4 flex justify-end border-t border-border pt-3"><Button type="button" size="sm" onClick={onSave} disabled={saving}><Save className="size-4" />{saving ? "Saving…" : "Save section"}</Button></div></div>
    </details>
  );
}
