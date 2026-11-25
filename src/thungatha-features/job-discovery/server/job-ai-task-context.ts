import "server-only";
import { mapRowToProfileDto } from "@/thungatha-features/user-profile/server/user-profile-mapper";
import type { ProfileDatabaseRow } from "@/thungatha-features/user-profile/server/profile-database-row";
import { PROFILE_SELECT_COLUMNS } from "@/thungatha-features/user-profile/server/repository";
import { deriveCandidateFacts } from "@/thungatha-features/user-profile/server/candidate-facts";
import {
  createJobMatchingContext,
  hashDescription,
  hashJobContext,
  isUsableJobDescription,
} from "./job-ai-queue-eligibility";
import type { createServiceClient } from "./job-ai-queue-eligibility";

type Database = ReturnType<typeof createServiceClient>;
type TaskIdentity = {
  job_id: string;
  user_id: string;
  profile_version: number;
  job_description_hash: string;
  job_context_hash: string;
};

export async function loadCurrentJobAiTaskContext(
  db: Database,
  task: TaskIdentity,
) {
  const [jobResult, profileResult] = await Promise.all([
    db.from("jobs")
      .select("id,title,employer_name,location_text,description")
      .eq("id", task.job_id)
      .maybeSingle(),
    db.from("profiles")
      .select(PROFILE_SELECT_COLUMNS)
      .eq("user_id", task.user_id)
      .maybeSingle(),
  ]);
  if (jobResult.error) throw jobResult.error;
  if (profileResult.error) throw profileResult.error;
  const job = jobResult.data;
  const row = profileResult.data as ProfileDatabaseRow | null;
  if (!job || !row) return null;

  const context = createJobMatchingContext(job);
  if (
    !isUsableJobDescription(context.description) ||
    hashDescription(context.description) !== task.job_description_hash ||
    hashJobContext(context) !== task.job_context_hash
  ) return null;

  const facts = deriveCandidateFacts(mapRowToProfileDto(row));
  if (!facts || facts.profileVersion !== task.profile_version) return null;
  return { job, context, facts };
}
