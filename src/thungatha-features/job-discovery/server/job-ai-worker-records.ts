import "server-only";
import type { createJobAiClient, QueueTask } from "./job-ai-task-processor";
import {
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

export function recordJobAiTaskOutcome(
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

export async function recordJobAiTaskFailure(
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
    provider:
      typeof details.record?.provider === "string"
        ? details.record.provider
        : undefined,
    code:
      typeof details.record?.code === "string"
        ? details.record.code
        : undefined,
    retryable:
      typeof details.record?.retryable === "boolean"
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
