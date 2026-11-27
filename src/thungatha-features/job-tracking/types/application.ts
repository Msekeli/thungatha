export const applicationStatuses = [
  "Draft",
  "Submitted",
  "Under review",
  "Interview",
  "Offer",
  "Accepted",
  "Rejected",
  "Withdrawn",
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

export type ApplicationStatusHistoryEntry = {
  id: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  changedAt: string;
  actor: "user";
};

export type ApplicationRecord = {
  id: string;
  company: string;
  jobTitle: string;
  applicationDate: string;
  source: string;
  url: string;
  status: ApplicationStatus;
  statusHistory: ApplicationStatusHistoryEntry[];
  notes: string;
  jobDescription: string;
};
