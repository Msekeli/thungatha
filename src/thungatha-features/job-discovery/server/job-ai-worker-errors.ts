import "server-only";
import type { createJobAiClient, QueueTask } from "./job-ai-task-processor";

type Database = ReturnType<typeof createJobAiClient>;
type TaskError = {
  message?: unknown;
  code?: unknown;
  details?: unknown;
  hint?: unknown;
  retryAfterMs?: unknown;
  provider?: unknown;
  retryable?: unknown;
};

function readTaskError(error: unknown): TaskError | null {
  return error && typeof error === "object" ? (error as TaskError) : null;
}

function describeTaskError(error: unknown, record: TaskError | null) {
  if (error instanceof Error) return error.message;
  if (typeof record?.message !== "string") return "AI task processing failed";
  return [record.message, record.code, record.details, record.hint]
    .filter(
      (value): value is string => typeof value === "string" && value.length > 0,
    )
    .join(" | ");
}

export function getTaskRetryDetails(error: unknown) {
  const record = readTaskError(error);
  const message = describeTaskError(error, record)
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "[REDACTED]")
    .slice(0, 500);
  const retryAfterMs =
    typeof record?.retryAfterMs === "number" &&
    Number.isFinite(record.retryAfterMs)
      ? Math.max(0, record.retryAfterMs)
      : 0;
  return {
    record,
    message,
    terminal: record?.retryable === false,
    retryAfterMs,
  };
}

export async function saveTaskRetryState(
  db: Database,
  task: QueueTask,
  details: ReturnType<typeof getTaskRetryDetails>,
) {
  const exponentialDelayMs =
    Math.min(60, 2 ** Math.min(task.attempts, 6)) * 60_000;
  const retryDelayMs = Math.max(exponentialDelayMs, details.retryAfterMs);
  const { error } = await db
    .from("ai_task_queue")
    .update({
      status: details.terminal ? "failed" : "pending",
      available_at: new Date(Date.now() + retryDelayMs).toISOString(),
      locked_at: null,
      last_error: details.message,
      updated_at: new Date().toISOString(),
    })
    .eq("id", task.id)
    .eq("status", "processing");
  if (error)
    throw new Error(
      `Task failed (${details.message}), and its retry state could not be saved: ${error.message}`,
    );
}

export async function deferQueueAfterRateLimit(
  db: Database,
  retryAfterMs: number,
) {
  const cooldownMs = Math.max(retryAfterMs, 60_000);
  const cooldownUntil = new Date(Date.now() + cooldownMs).toISOString();
  const { error } = await db
    .from("ai_task_queue")
    .update({
      available_at: cooldownUntil,
      updated_at: new Date().toISOString(),
    })
    .eq("task_type", "job_fit_assessment")
    .eq("status", "pending")
    .lt("available_at", cooldownUntil);
  if (error) {
    console.error(
      "[AI job matching] Could not defer remaining tasks after provider rate limit",
      {
        error: error.message,
      },
    );
  } else {
    console.warn(
      "[AI job matching] Deferred remaining queued assessments after provider rate limit",
      {
        cooldownMs,
      },
    );
  }
}
