import "server-only";
import type { CandidateFacts } from "@/thungatha-features/user-profile/server/candidate-facts";
import type { JobMatchingContext } from "./job-ai-queue-eligibility";
import { createServiceClient } from "./job-ai-queue-eligibility";
import { assessJobWithAi } from "./job-ai-service";

type Database = ReturnType<typeof createServiceClient>;
type Task = {
  id: string;
  user_id: string;
  job_id: string;
  profile_version: number;
  job_context_hash: string;
  assessment_version: string;
};

export async function persistJobAiAssessment(
  db: Database,
  task: Task,
  context: JobMatchingContext,
  facts: CandidateFacts,
  generated: Awaited<ReturnType<typeof assessJobWithAi>>,
) {
  const { data, error } = await db.rpc("persist_job_match_assessment", {
    p_task_id: task.id,
    p_user_id: task.user_id,
    p_job_id: task.job_id,
    p_profile_version: task.profile_version,
    p_profile_confirmed_at: facts.confirmedAt,
    p_job_description: context.description,
    p_job_context_hash: task.job_context_hash,
    p_job_context: context,
    p_assessment_version: task.assessment_version,
    p_classification: generated.assessment.classification,
    p_assessment: generated.assessment,
    p_provider: generated.provider,
    p_model: generated.model,
  });
  if (error) throw error;
  return Boolean(data);
}
