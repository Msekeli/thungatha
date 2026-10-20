"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { JobDiscoveryHeader } from "./job-discovery-header";
import { JobUndoNotice } from "./job-undo-notice";
import { Toast } from "@/components/ui/toast";
import type { Filters, Job } from "../job-discovery-utils";

type UndoAction = {
  jobId: string;
  title: string;
  previousState: "saved" | "dismissed" | null;
  nextState: "saved" | "dismissed" | null;
} | null;

type Props = {
  isAuthenticated: boolean;
  draft: Filters;
  filtersOpen: boolean;
  categories: { key: string; label: string; count: number | null }[];
  category: string;
  sortOrder: string;
  jobs: Job[];
  onQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleFilters: (anchorEl: HTMLElement) => void;
  onSortChange: (value: string) => void;
  onCategoryChange: (key: string, label: string) => void;
  undoAction: UndoAction;
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
      {!props.isAuthenticated && (
        <div className="th-jobs-auth-notice" role="status">
          <p>Your session has expired. Sign in again to browse job listings.</p>
          <Link href="/sign-in">Go to sign in</Link>
        </div>
      )}
      <JobDiscoveryHeader
        draft={props.draft}
        categories={props.categories}
        category={props.category}
        jobs={props.jobs}
        onQueryChange={props.onQueryChange}
        onLocationChange={props.onLocationChange}
        onSubmit={props.onSubmit}
        onToggleFilters={props.onToggleFilters}
        onCategoryChange={props.onCategoryChange}
      />
      {props.undoAction && (
        <JobUndoNotice
          action={props.undoAction}
          busy={props.stateBusy}
          onUndo={props.onUndo}
          onDismiss={props.onDismissUndo}
        />
      )}
      {props.stateMessage && !props.undoAction && (
        <Toast
          message={props.stateMessage}
          tone="success"
          onDismiss={props.onDismissMessage}
        />
      )}
      {props.stateError && (
        <Toast
          message={props.stateError}
          tone="error"
          onDismiss={props.onDismissError}
        />
      )}
    </>
  );
}
