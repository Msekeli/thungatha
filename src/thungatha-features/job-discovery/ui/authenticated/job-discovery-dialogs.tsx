"use client";

import type { Dispatch, SetStateAction } from "react";
import { ProfileSetupDialog } from "./profile-setup-dialog";
import { MatchBreakdownDialog } from "../shared/match-breakdown-dialog";
import { ApplicationConfirmationDialog } from "./application-confirmation-dialog";
import { JobFiltersDialog } from "./job-filters-dialog";
import type { Filters } from "../job-discovery-utils";

type Props = {
  filtersOpen: boolean;
  filterAnchorEl: HTMLElement | null;
  draft: Filters;
  changeDraft: (key: keyof Filters, value: string) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  setFiltersOpen: Dispatch<SetStateAction<boolean>>;
  profileSetupPrompt: boolean;
  setProfileSetupPrompt: Dispatch<SetStateAction<boolean>>;
  profileSetupAnchorEl: HTMLElement | null;
  setProfileSetupAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
  routerPushProfile: () => void;
  matchOpen: boolean;
  setMatchOpen: Dispatch<SetStateAction<boolean>>;
  matchAnchorEl: HTMLElement | null;
  applicationPromptAnchorEl: HTMLElement | null;
  showApplicationPrompt: boolean;
  stateBusy: boolean;
  jobTitle: string;
  employer: string;
  onCloseApplicationPrompt: () => void;
  onConfirmApplied: () => void;
};

export function JobDiscoveryDialogs(props: Props) {
  return (
    <>
      <JobFiltersDialog
        open={props.filtersOpen}
        anchorEl={props.filterAnchorEl}
        draft={props.draft}
        onClose={() => props.setFiltersOpen(false)}
        onChange={props.changeDraft}
        onReset={props.clearFilters}
        onApply={() => {
          props.applyFilters();
          props.setFiltersOpen(false);
        }}
      />
      <ProfileSetupDialog
        open={props.profileSetupPrompt}
        anchorEl={props.profileSetupAnchorEl}
        onClose={() => {
          props.setProfileSetupPrompt(false);
          props.setProfileSetupAnchorEl(null);
        }}
        onCreateProfile={() => {
          props.setProfileSetupPrompt(false);
          props.setProfileSetupAnchorEl(null);
          props.routerPushProfile();
        }}
      />
      <MatchBreakdownDialog
        open={props.matchOpen}
        anchorEl={props.matchAnchorEl}
        onClose={() => props.setMatchOpen(false)}
      />
      <ApplicationConfirmationDialog
        open={props.showApplicationPrompt}
        anchorEl={props.applicationPromptAnchorEl}
        busy={props.stateBusy}
        jobTitle={props.jobTitle}
        employer={props.employer}
        onClose={props.onCloseApplicationPrompt}
        onConfirm={props.onConfirmApplied}
      />
    </>
  );
}
