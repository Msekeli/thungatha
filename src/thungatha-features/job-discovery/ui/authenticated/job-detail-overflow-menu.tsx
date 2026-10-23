"use client";

import { Menu } from "@base-ui/react/menu";
import { Button } from "@/components/ui/button";
import { Ellipsis } from "lucide-react";
import { ProtectedDiscoveryAction } from "../shared/protected-discovery-action";

export function JobDetailOverflowMenu({
  configured,
  disabled,
  dismissed,
  onDismiss,
}: {
  configured: boolean;
  disabled: boolean;
  dismissed: boolean;
  onDismiss: () => void;
}) {
  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button
            variant="outline"
            size="icon"
            aria-label="More job actions"
            disabled={disabled}
          >
            <Ellipsis aria-hidden="true" />
          </Button>
        }
      />
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={6}>
          <Menu.Popup className="z-[1600] min-w-44 rounded-lg border border-line bg-panel p-1 text-sm text-fg shadow-lg">
            <Menu.Item
              className="flex min-h-10 cursor-pointer items-center rounded-md px-3 outline-none hover:bg-panel-2 focus:bg-panel-2 data-[highlighted]:bg-panel-2"
              disabled={disabled}
            >
              <ProtectedDiscoveryAction
                configured={configured}
                title="Personalise your job feed"
                description="Sign in or create a free account to dismiss jobs you are not interested in."
                onAction={onDismiss}
              >
                <span className="block w-full">
                  {dismissed ? "Restore opportunity" : "Dismiss opportunity"}
                </span>
              </ProtectedDiscoveryAction>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
