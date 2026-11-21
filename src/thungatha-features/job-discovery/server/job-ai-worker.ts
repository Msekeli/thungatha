import "server-only";
import { createJobAiClient, processJobAiTask, type QueueTask } from "./job-ai-task-processor";

export type TaskDiagnostic = {
  taskId: string;
  jobId: string;
  outcome: "processed" | "stale" | "failed";
  attempts: number;
  error?: string;
};

export type WorkerDiagnostics = {
  claimed: number; processed: number; stale: number; failed: number; durationMs: number;
  tasks: TaskDiagnostic[];
};

export async function processJobAiQueue(maxTasks = 1): Promise<WorkerDiagnostics> {
  const startTime = Date.now();
  const db = createJobAiClient();
  const tasks: TaskDiagnostic[] = [];
  let processed = 0; let stale = 0; let failed = 0;
  const boundedMax = Math.max(1, Math.min(maxTasks, 1));

  for (let index = 0; index < boundedMax; index += 1) {
    const { data, error } = await db.rpc("claim_ai_job_matching_task");
    if (error) throw error;
    const task = (data?.[0] ?? null) as QueueTask | null;
    if (!task) break;

    try {
      const outcome = await processJobAiTask(db, task);
      if (outcome === "stale") stale += 1;
      else processed += 1;
      tasks.push({ taskId: task.id, jobId: task.job_id, outcome, attempts: task.attempts });
    } catch (error) {
      const errorRecord = error && typeof error === "object"
        ? error as { message?: unknown; code?: unknown; details?: unknown; hint?: unknown }
        : null;
      const rawMessage = error instanceof Error
        ? error.message
        : typeof errorRecord?.message === "string"
          ? [
              errorRecord.message,
              typeof errorRecord.code === "string" ? `code=${errorRecord.code}` : "",
              typeof errorRecord.details === "string" ? errorRecord.details : "",
              typeof errorRecord.hint === "string" ? `hint=${errorRecord.hint}` : "",
            ].filter(Boolean).join(" | ")
          : "AI task processing failed";
      const sanitized = rawMessage.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "[REDACTED]").slice(0, 500);
      const terminal = task.attempts >= 4;
      const delayMinutes = Math.min(60, 2 ** task.attempts);

      // Keep failures visible in server logs as well as in the queue row and
      // worker response. Do not log prompts, evidence, or provider payloads.
      console.error("[AI job matching] Task failed", {
        taskId: task.id,
        jobId: task.job_id,
        attempt: task.attempts,
        terminal,
        error: sanitized,
      });
      const { error: updateError } = await db.from("ai_task_queue").update({
        status: terminal ? "failed" : "pending",
        available_at: new Date(Date.now() + delayMinutes * 60_000).toISOString(),
        locked_at: null, last_error: sanitized, updated_at: new Date().toISOString(),
      }).eq("id", task.id).eq("status", "processing");
      if (updateError) throw updateError;
      failed += 1;
      tasks.push({
        taskId: task.id,
        jobId: task.job_id,
        outcome: "failed",
        attempts: task.attempts,
        error: sanitized,
      });
    }
  }

  return { claimed: tasks.length, processed, stale, failed, durationMs: Date.now() - startTime, tasks };
}
