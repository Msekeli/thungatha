import "server-only";
import { createJobAiClient, processJobAiTask, type QueueTask } from "./job-ai-task-processor";

export async function processJobAiQueue(maxTasks = 1) {
  const db = createJobAiClient();
  const summary = { processed: 0, stale: 0, failed: 0 };
  for (let index = 0; index < Math.max(1, Math.min(maxTasks, 5)); index += 1) {
    const { data, error } = await db.rpc("claim_ai_job_matching_task");
    if (error) throw error;
    const task = (data?.[0] ?? null) as QueueTask | null;
    if (!task) break;
    try {
      const result = await processJobAiTask(db, task);
      if (result === "stale") summary.stale += 1;
      else summary.processed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown AI task failure";
      const terminal = task.attempts >= 4;
      const delayMinutes = Math.min(60, 2 ** task.attempts);
      const { error: updateError } = await db.from("ai_task_queue").update({
        status: terminal ? "failed" : "pending",
        available_at: new Date(Date.now() + delayMinutes * 60_000).toISOString(),
        locked_at: null, last_error: message.slice(0, 1000),
        updated_at: new Date().toISOString(),
      }).eq("id", task.id);
      if (updateError) throw updateError;
      summary.failed += 1;
    }
  }
  return summary;
}
