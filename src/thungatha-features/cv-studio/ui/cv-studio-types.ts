import type { MasterCv } from "./cv-studio-content-types";

export type JobContext = {
  source: "discovery" | "pasted";
  jobId: string | null;
  title: string;
  company: string | null;
  location: string | null;
  sourceUrl: string | null;
  description: string;
  descriptionFingerprint: string;
  retrievedAt: string;
};

export type MatchingVersion = {
  id: string;
  versionNumber: number;
  updatedAt: string;
  accentColour: string;
};

export type Suitability = {
  status:
    | "existing_version_found"
    | "new_version_recommended"
    | "assessment_unavailable";
  matchingVersions: MatchingVersion[];
  recommendation: "reuse_existing" | "prepare_new_draft" | "review_manually";
  explanation: string;
  semanticAssessment: "unavailable";
};

export type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "profile_required"; confirmed: boolean; missing: string[] }
  | {
      status: "master_cv_ready";
      profileVersion: number;
      masterCv: MasterCv | null;
      isStale?: boolean;
    };

export type JobForm = {
  title: string;
  company: string;
  description: string;
};

export const emptyJobForm: JobForm = {
  title: "",
  company: "",
  description: "",
};
