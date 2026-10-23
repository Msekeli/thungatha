"use client";

import { X } from "lucide-react";
import { AnchoredPopover } from "@/components/ui/anchored-popover";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onCreateProfile: () => void;
};

export function ProfileSetupDialog({
  open,
  anchorEl,
  onClose,
  onCreateProfile,
}: Props) {
  return (
    <AnchoredPopover
      open={open}
      anchor={anchorEl}
      side="right"
      sideOffset={10}
      onClose={onClose}
      label="Set up your job profile"
      className="max-h-[min(72dvh,520px)] w-[min(360px,calc(100vw-24px))] overflow-y-auto rounded-xl border border-line bg-panel text-fg shadow-xl"
    >
      <header className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
        <strong>Get better job matches</strong>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Dismiss profile setup"
          onClick={onClose}
        >
          <X size={16} />
        </Button>
      </header>
      <div className="p-4">
        <h3 className="mb-2 mt-0 text-base font-bold">Set up your profile</h3>
        <p className="mb-4 mt-0 leading-relaxed text-fg-muted">
          Add your experience, skills and career preferences so Thungatha can
          help you find relevant opportunities and prepare your CV for each
          role.
        </p>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Do this later
          </Button>
          <Button variant="primary" onClick={onCreateProfile}>
            Create my profile
          </Button>
        </div>
      </div>
    </AnchoredPopover>
  );
}
