"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { children: ReactNode; onClose: () => void };

export function PublicJobMobileFilters({ children, onClose }: Props) {
  return <div className="th-mobile-filter-backdrop" role="presentation" onClick={onClose}>
    <section className="th-mobile-filter-sheet" role="dialog" aria-modal="true" aria-label="Job filters" onClick={(event) => event.stopPropagation()}>
      <div className="th-mobile-filter-sheet-head"><strong>Filters</strong><Button variant="ghost" size="sm" type="button" aria-label="Close filters" onClick={onClose}><X size={18}/></Button></div>
      {children}
    </section>
  </div>;
}
