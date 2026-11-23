import "server-only";
import { createJobAiClient, processJobAiTask, type QueueTask } from "./job-ai-task-processor";

export type TaskDiagnostic = {
  taskId: string;
  jobId: string;
  outcome: "processed" | "stale" | "unavailable" | "failed";
  attempts: number;
  error?: string;
};

export type WorkerDiagnostics = {
  claimed: number; processed: number; stale: number; unavailable: number; failed: number; durationMs: number;
  tasks: TaskDiagnostic[];
};

export async function processJobAiQueue(): Promise<WorkerDiagnostics> {
  const startTime = Date.now();
  const db = createJobAiClient();
  const tasks: TaskDiagnostic[] = [];
  let processed = 0; let stale = 0; let unavailable = 0; let failed = 0;
  while (true) {
    const { data, error } = await db.rpc("claim_ai_job_matching_task");
    if (error) throw error;
    const task = (data?.[0] ?? null) as QueueTask | null;
    if (!task) break;

    try {
      const outcome = await processJobAiTask(db, task);
      if (outcome === "stale") stale += 1;
      else if (outcome === "unavailable") unavailable += 1;
      else processed += 1;
      tasks.push({ taskId: task.id, jobId: task.job_id, outcome, attempts: task.attempts });
    } catch (error) {
      const errorRecord = error && typeof error === "object"
        ? error as { message?: unknown; code?: unknown; details?: unknown; hint?: unknown; retryAfterMs?: unknown; provider?: unknown; retryable?: unknown }
        : null;
      const rawMessage = error instanceof Error
        ? error.message
        : typeof errorRecord?.message === "string"
          ? [errorRecord.message, errorRecord.code, errorRecord.details, errorRecord.hint]
              .filter((value): value is string => typeof value === "string" && value.length > 0).join(" | ")
          : "AI task processing failed";
      const sanitized = rawMessage.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "[REDACTED]").slice(0, 500);
      const terminal = errorRecord?.retryable === false;
      const exponentialDelayMs = Math.min(60, 2 ** Math.min(task.attempts, 6)) * 60_000;
      const providerRetryAfterMs = typeof errorRecord?.retryAfterMs === "number" && Number.isFinite(errorRecord.retryAfterMs)
        ? Math.max(0, errorRecord.retryAfterMs)
        : 0;
      const retryDelayMs = Math.max(exponentialDelayMs, providerRetryAfterMs);

      console.error("[AI job matching] Task failed", {
        taskId: task.id, jobId: task.job_id, attempt: task.attempts, terminal, error: sanitized,
        provider: typeof errorRecord?.provider === "string" ? errorRecord.provider : undefined,
        code: typeof errorRecord?.code === "string" ? errorRecord.code : undefined,
        retryable: typeof errorRecord?.retryable === "boolean" ? errorRecord.retryable : undefined,
        retryAfterMs: providerRetryAfterMs || undefined,
      });
      const { error: updateError } = await db.from("ai_task_queue").update({
        status: terminal ? "failed" : "pending",
        available_at: new Date(Date.now() + retryDelayMs).toISOString(),
        locked_at: null, last_error: sanitized, updated_at: new Date().toISOString(),
      }).eq("id", task.id).eq("status", "processing");
      if (updateError) throw new Error(`Task failed (${sanitized}), and its retry state could not be saved: ${updateError.message}`);
      failed += 1;
      tasks.push({ taskId: task.id, jobId: task.job_id, outcome: "failed", attempts: task.attempts, error: sanitized });
    }
  }

  return { claimed: tasks.length, processed, stale, unavailable, failed, durationMs: Date.now() - startTime, tasks };
}
