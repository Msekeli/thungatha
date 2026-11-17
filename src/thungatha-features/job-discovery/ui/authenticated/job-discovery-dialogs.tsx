"use client";

import type { Dispatch, SetStateAction } from "react";
import { ProfileSetupDialog } from "./profile-setup-dialog";
import { MatchBreakdownDialog } from "../shared/match-breakdown-dialog";
import { ApplicationConfirmationDialog } from "./application-confirmation-dialog";
import { JobDismissalDialog } from "./job-dismissal-dialog";
import type { Job } from "../job-discovery-utils";

type Props = {
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
  pendingDismissJob: Job | null;
  onCloseDismissDialog: () => void;
  onConfirmDismiss: (scope: "job" | "employer") => void;
};

export function JobDiscoveryDialogs(props: Props) {
  return (
    <>
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
      <JobDismissalDialog
        job={props.pendingDismissJob}
        busy={props.stateBusy}
        onClose={props.onCloseDismissDialog}
        onConfirm={props.onConfirmDismiss}
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
