"use client";

import type { FormEvent } from "react";
import { JobDiscoveryHeader } from "./job-discovery-header";
import { JobDiscoveryFeedback, type JobUndoAction } from "./job-discovery-feedback";
import type { Filters } from "../job-discovery-utils";

type Props = {
  isAuthenticated: boolean;
  draft: Filters;
  filtersOpen: boolean;
  categories: { key: string; label: string; count: number | null }[];
  category: string;
  onQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleFilters: (anchorEl: HTMLElement) => void;
  onCategoryChange: (key: string, label: string) => void;
  undoAction: JobUndoAction;
  stateBusy: boolean;
  onUndo: () => void;
  onDismissUndo: () => void;
  stateMessage: string | null;
  onDismissMessage: () => void;
  stateError: string | null;
  onDismissError: () => void;
};

export function JobDiscoveryControls(props: Props) {
  return (
    <>
      <JobDiscoveryHeader
        draft={props.draft}
        categories={props.categories}
        category={props.category}
        onQueryChange={props.onQueryChange}
        onLocationChange={props.onLocationChange}
        onSubmit={props.onSubmit}
        onToggleFilters={props.onToggleFilters}
        onCategoryChange={props.onCategoryChange}
      />
      <JobDiscoveryFeedback
        isAuthenticated={props.isAuthenticated}
        undoAction={props.undoAction}
        stateBusy={props.stateBusy}
        onUndo={props.onUndo}
        onDismissUndo={props.onDismissUndo}
        stateMessage={props.stateMessage}
        onDismissMessage={props.onDismissMessage}
        stateError={props.stateError}
        onDismissError={props.onDismissError}
      />
    </>
  );
}
