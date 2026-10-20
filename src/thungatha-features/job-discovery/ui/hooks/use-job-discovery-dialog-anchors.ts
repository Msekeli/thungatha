import { useEffect } from "react";
import type { useJobDiscoveryState } from "./use-job-discovery-state";

type State = ReturnType<typeof useJobDiscoveryState>;

export function useJobDiscoveryDialogAnchors(
  state: State,
  showApplicationPrompt: boolean,
) {
  const setApplicationPromptAnchorEl = state.setApplicationPromptAnchorEl;
  const setProfileSetupAnchorEl = state.setProfileSetupAnchorEl;
  useEffect(() => {
    if (!showApplicationPrompt || state.applicationPromptAnchorEl?.isConnected)
      return;
    const anchor = document.querySelector<HTMLElement>(
      "[data-job-application-trigger]",
    );
    if (anchor) setApplicationPromptAnchorEl(anchor);
  }, [
    showApplicationPrompt,
    state.applicationPromptAnchorEl,
    state.selectedId,
    setApplicationPromptAnchorEl,
  ]);

  useEffect(() => {
    if (!state.profileSetupPrompt || state.profileSetupAnchorEl?.isConnected)
      return;
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.th-workspace-sidebar a[href="/profile"], .th-mobile-workspace-header-actions button[aria-controls="th-mobile-workspace-menu"]',
      ),
    );
    const anchor = candidates.find(
      (element) => element.getClientRects().length > 0,
    );
    if (anchor) setProfileSetupAnchorEl(anchor);
  }, [
    state.profileSetupPrompt,
    state.profileSetupAnchorEl,
    setProfileSetupAnchorEl,
  ]);
}
