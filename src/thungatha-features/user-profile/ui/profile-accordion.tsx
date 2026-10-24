"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function ProfileAccordion({ title, description, status, children }: {
  title: string;
  description?: string;
  status: string;
  children: ReactNode;
}) {
  return (
    <details name="thungatha-profile-sections" className="th-profile-accordion group">
      <summary className="th-profile-accordion-trigger">
        <span className="th-profile-accordion-copy">
          <span className="th-profile-accordion-title">{title}</span>
          {description && <span className="th-profile-accordion-description">{description}</span>}
        </span>
        <span className="th-profile-accordion-meta">
          <span className="th-profile-accordion-status">{status}</span>
          <ChevronDown aria-hidden="true" className="th-profile-accordion-chevron" size={18} />
        </span>
      </summary>
      <div className="th-profile-accordion-panel">{children}</div>
    </details>
  );
}
