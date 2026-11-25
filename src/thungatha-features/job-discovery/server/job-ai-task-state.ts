import "server-only";
import type { createServiceClient } from "./job-ai-queue-eligibility";

type Database = ReturnType<typeof createServiceClient>;

export async function completeJobAiTask(db: Database, id: string) {
  const { error } = await db
    .from("ai_task_queue")
    .update({
      status: "completed",
      locked_at: null,
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function markJobAiAssessmentUnavailable(
  db: Database,
  id: string,
  reason: string,
) {
  const { error } = await db
    .from("ai_task_queue")
    .update({
      status: "unavailable",
      locked_at: null,
      last_error: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "processing");
  if (error) throw error;
}
