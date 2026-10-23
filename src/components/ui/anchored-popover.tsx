"use client";

import type { ReactNode } from "react";
import { Popover } from "@base-ui/react/popover";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  anchor: HTMLElement | null;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  align?: "start" | "center" | "end";
  onClose: () => void;
  label: string;
  className: string;
  children: ReactNode;
};

export function AnchoredPopover({
  open,
  anchor,
  side = "bottom",
  sideOffset = 8,
  align = "start",
  onClose,
  label,
  className,
  children,
}: Props) {
  return (
    <Popover.Root
      open={open && Boolean(anchor)}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <Popover.Portal>
        <Popover.Positioner
          anchor={anchor}
          side={side}
          sideOffset={sideOffset}
          align={align}
          collisionPadding={12}
          className="z-[1500] max-w-[calc(100vw-24px)]"
        >
          <Popover.Popup
            role="dialog"
            aria-label={label}
            className={cn(className)}
          >
            {children}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
