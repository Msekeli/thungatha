import "server-only";
import {
  createJobAiClient,
  processJobAiTask,
  type QueueTask,
} from "./job-ai-task-processor";
import {
  deferQueueAfterRateLimit,
} from "./job-ai-worker-errors";
import {
  recordJobAiTaskFailure,
  recordJobAiTaskOutcome,
  type TaskDiagnostic,
} from "./job-ai-worker-records";

export type WorkerDiagnostics = {
  claimed: number;
  processed: number;
  stale: number;
  unavailable: number;
  failed: number;
  durationMs: number;
  tasks: TaskDiagnostic[];
};

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
      recordJobAiTaskOutcome(tasks, task, outcome);
    } catch (error) {
      const details = await recordJobAiTaskFailure(db, task, error, tasks);
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
