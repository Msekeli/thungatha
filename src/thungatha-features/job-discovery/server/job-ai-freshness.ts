import { createHash } from "node:crypto";

type ExpectedAssessmentInput = {
  profile_version: number;
  job_description_hash: string;
};

type CurrentAssessmentInput = {
  description: string | null;
  profileVersion: number | null;
  confirmedAt: string | null;
};

export function isAssessmentInputCurrent(
  expected: ExpectedAssessmentInput, current: CurrentAssessmentInput,
): boolean {
  if (!current.description || !current.confirmedAt || current.profileVersion === null) return false;
  const currentHash = createHash("sha256").update(current.description).digest("hex");
  return current.profileVersion === expected.profile_version && currentHash === expected.job_description_hash;
}
