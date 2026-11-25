import "server-only";
import {
  assessJobWithAi,
} from "./job-ai-service";
import { AssessmentUnavailableError } from "./job-ai-classification";
import {
  JOB_AI_ASSESSMENT_VERSION,
  createServiceClient,
} from "./job-ai-queue-eligibility";
import { completeJobAiTask, markJobAiAssessmentUnavailable } from "./job-ai-task-state";
import { loadCurrentJobAiTaskContext } from "./job-ai-task-context";
import { getOrCreateJobUnderstanding } from "./job-ai-understanding-cache";

export type QueueTask = {
  id: string;
  user_id: string;
  job_id: string;
  profile_version: number;
  job_description_hash: string;
  job_context_hash: string;
  assessment_version: string;
  attempts: number;
};

export const createJobAiClient = createServiceClient;

export async function processJobAiTask(
  db: ReturnType<typeof createServiceClient>,
  task: QueueTask,
) {
  if (task.assessment_version !== JOB_AI_ASSESSMENT_VERSION) {
    await completeJobAiTask(db, task.id);
    return "stale";
  }
  const current = await loadCurrentJobAiTaskContext(db, task);
  if (!current) {
    await completeJobAiTask(db, task.id);
    return "stale";
  }

  const { job, context, facts } = current;
  console.info("[AI job matching] Task started", {
    taskId: task.id,
    jobId: task.job_id,
    title: job.title,
  });
  const understanding = await getOrCreateJobUnderstanding(
    db, task.job_id, context, task.job_context_hash,
  );

  console.info("[AI job matching] Candidate assessment started", {
    jobId: task.job_id,
  });
  let generated;
  try {
    generated = await assessJobWithAi(context, understanding, facts);
  } catch (error) {
    if (!(error instanceof AssessmentUnavailableError)) throw error;
    await markJobAiAssessmentUnavailable(db, task.id, error.message);
    console.info(
      "[AI job matching] Assessment unavailable; no classification assigned",
      { jobId: task.job_id, reason: error.message },
    );
    return "unavailable";
  }

  console.info("[AI job matching] Candidate assessment completed", {
    jobId: task.job_id,
    classification: generated.assessment.classification,
    provider: generated.provider,
    model: generated.model,
  });
  const { data: persisted, error: persistError } = await db.rpc(
    "persist_job_match_assessment",
    {
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
    },
  );
  if (persistError) throw persistError;
  if (!persisted) {
    console.info(
      "[AI job matching] Assessment became stale before persistence",
      { jobId: task.job_id },
    );
    return "stale";
  }
  console.info("[AI job matching] Assessment persisted", {
    jobId: task.job_id,
    classification: generated.assessment.classification,
  });
  return "processed";
}
