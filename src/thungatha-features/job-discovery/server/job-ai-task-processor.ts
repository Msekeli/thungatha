import "server-only";
import { assessJobWithAi } from "./job-ai-service";
import { AssessmentUnavailableError } from "./job-ai-classification";
import {
  JOB_AI_ASSESSMENT_VERSION,
  createServiceClient,
} from "./job-ai-queue-eligibility";
import {
  completeJobAiTask,
  markJobAiAssessmentUnavailable,
} from "./job-ai-task-state";
import { loadCurrentJobAiTaskContext } from "./job-ai-task-context";
import { getOrCreateQueuedJobUnderstanding } from "./job-ai-queued-understanding";
import { persistJobAiAssessment } from "./job-ai-assessment-persistence";

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
  const understanding = await getOrCreateQueuedJobUnderstanding(
    db,
    task.job_id,
    context,
    task.job_context_hash,
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
  const persisted = await persistJobAiAssessment(
    db,
    task,
    context,
    facts,
    generated,
  );
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
