"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnchoredPopover } from "@/components/ui/anchored-popover";

type Props = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
};

export function MatchBreakdownDialog({ open, anchorEl, onClose }: Props) {
  return (
    <AnchoredPopover
      open={open}
      anchor={anchorEl}
      onClose={onClose}
      label="Profile match breakdown"
      className="max-h-[min(72dvh,520px)] w-[min(380px,calc(100vw-24px))] overflow-y-auto rounded-xl border border-line bg-panel text-fg shadow-xl"
    >
      <header className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
        <strong>Profile match breakdown</strong>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Close match breakdown"
          onClick={onClose}
        >
          <X size={16} />
        </Button>
      </header>
      <div className="p-4 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_p]:mb-3 [&_p]:leading-relaxed [&_p]:text-fg-muted [&_ul]:mb-0 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:text-fg-muted">
        <h3 className="mt-0">Job matching is coming soon</h3>
        <p className="mt-0">
          Matching requires a completed profile with your skills and experience.
          No score is calculated or implied. Complete your profile so it is
          ready when matching launches.
        </p>
        <ul>
          <li>Confirmed — evidence from your profile</li>
          <li>Inferred — possible match based on related experience</li>
          <li>Missing — not found in your profile</li>
          <li>Can’t verify — not enough information</li>
        </ul>
      </div>
    </AnchoredPopover>
  );
}
