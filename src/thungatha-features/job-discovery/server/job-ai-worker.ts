import "server-only";
import {
  createJobAiClient,
  processJobAiTask,
  type QueueTask,
} from "./job-ai-task-processor";
import {
  deferQueueAfterRateLimit,
  getTaskRetryDetails,
  saveTaskRetryState,
} from "./job-ai-worker-errors";

export type TaskDiagnostic = {
  taskId: string;
  jobId: string;
  outcome: "processed" | "stale" | "unavailable" | "failed";
  attempts: number;
  error?: string;
};

export type WorkerDiagnostics = {
  claimed: number;
  processed: number;
  stale: number;
  unavailable: number;
  failed: number;
  durationMs: number;
  tasks: TaskDiagnostic[];
};

function recordOutcome(
  tasks: TaskDiagnostic[],
  task: QueueTask,
  outcome: "processed" | "stale" | "unavailable",
) {
  tasks.push({
    taskId: task.id,
    jobId: task.job_id,
    outcome,
    attempts: task.attempts,
  });
}

async function recordFailure(
  db: ReturnType<typeof createJobAiClient>,
  task: QueueTask,
  error: unknown,
  tasks: TaskDiagnostic[],
) {
  const details = getTaskRetryDetails(error);
  console.error("[AI job matching] Task failed", {
    taskId: task.id,
    jobId: task.job_id,
    attempt: task.attempts,
    terminal: details.terminal,
    error: details.message,
    provider: typeof details.record?.provider === "string"
      ? details.record.provider
      : undefined,
    code: typeof details.record?.code === "string"
      ? details.record.code
      : undefined,
    retryable: typeof details.record?.retryable === "boolean"
      ? details.record.retryable
      : undefined,
    retryAfterMs: details.retryAfterMs || undefined,
  });
  await saveTaskRetryState(db, task, details);
  tasks.push({
    taskId: task.id,
    jobId: task.job_id,
    outcome: "failed",
    attempts: task.attempts,
    error: details.message,
  });
  return details;
}

export async function processJobAiQueue(
  options: { jobIds?: string[] } = {},
): Promise<WorkerDiagnostics> {
  const jobIds = options.jobIds?.length ? [...new Set(options.jobIds)] : null;
  const startTime = Date.now();
  const db = createJobAiClient();
  const tasks: TaskDiagnostic[] = [];
  let processed = 0;
  let stale = 0;
  let unavailable = 0;
  let failed = 0;

  while (!jobIds || tasks.length < jobIds.length) {
    const { data, error } = await db.rpc("claim_ai_job_matching_task", {
      p_job_ids: jobIds,
    });
    if (error) throw error;
    const task = (data?.[0] ?? null) as QueueTask | null;
    if (!task) break;

    try {
      const outcome = await processJobAiTask(db, task);
      if (outcome === "stale") stale += 1;
      else if (outcome === "unavailable") unavailable += 1;
      else processed += 1;
      recordOutcome(tasks, task, outcome);
    } catch (error) {
      const details = await recordFailure(db, task, error, tasks);
      failed += 1;
      if (details.record?.code === "rate-limited") {
        await deferQueueAfterRateLimit(db, details.retryAfterMs);
        break;
      }
    }
  }

  return {
    claimed: tasks.length,
    processed,
    stale,
    unavailable,
    failed,
    durationMs: Date.now() - startTime,
    tasks,
  };
}
