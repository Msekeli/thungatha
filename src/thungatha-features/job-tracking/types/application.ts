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

export type ApplicationRecord = {
  id: string;
  company: string;
  jobTitle: string;
  applicationDate: string;
  source: string;
  url: string;
  status: ApplicationStatus;
  notes: string;
  jobDescription: string;
};
