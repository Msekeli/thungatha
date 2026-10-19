"use client";

import type { Dispatch, SetStateAction } from "react";
import { ProfileSetupDialog } from "./profile-setup-dialog";
import { MatchBreakdownDialog } from "./match-breakdown-dialog";
import { ApplicationConfirmationDialog } from "./application-confirmation-dialog";
import { JobFiltersDialog } from "./job-filters-dialog";
import type { Filters } from "../job-discovery-utils";

type Props = {
  filtersOpen: boolean;
  draft: Filters;
  changeDraft: (key: keyof Filters, value: string) => void;
  clearFilters: () => void;
  setFilters: Dispatch<SetStateAction<Filters>>;
  setPage: Dispatch<SetStateAction<number>>;
  setMobileDetail: Dispatch<SetStateAction<boolean>>;
  setFiltersOpen: Dispatch<SetStateAction<boolean>>;
  profileSetupPrompt: boolean;
  setProfileSetupPrompt: Dispatch<SetStateAction<boolean>>;
  routerPushProfile: () => void;
  matchOpen: boolean;
  setMatchOpen: Dispatch<SetStateAction<boolean>>;
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
        draft={props.draft}
        onClose={() => props.setFiltersOpen(false)}
        onChange={props.changeDraft}
        onReset={props.clearFilters}
        onApply={() => {
          props.setFilters({ ...props.draft });
          props.setPage(1);
          props.setMobileDetail(false);
          props.setFiltersOpen(false);
        }}
      />
      <ProfileSetupDialog
        open={props.profileSetupPrompt}
        onClose={() => props.setProfileSetupPrompt(false)}
        onCreateProfile={props.routerPushProfile}
      />
      <MatchBreakdownDialog
        open={props.matchOpen}
        onClose={() => props.setMatchOpen(false)}
      />
      <ApplicationConfirmationDialog
        open={props.showApplicationPrompt}
        busy={props.stateBusy}
        jobTitle={props.jobTitle}
        employer={props.employer}
        onClose={props.onCloseApplicationPrompt}
        onConfirm={props.onConfirmApplied}
      />
    </>
  );
}
