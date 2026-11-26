import "server-only";
import type { createServiceClient } from "./job-ai-queue-eligibility";
import {
  JOB_AI_UNDERSTANDING_VERSION,
  type JobMatchingContext,
} from "./job-ai-queue-eligibility";
import {
  parseJobUnderstanding,
  understandJobWithAi,
} from "./job-ai-service";
import type { JobUnderstanding } from "./job-ai-schemas";

type Database = ReturnType<typeof createServiceClient>;

export async function getOrCreateQueuedJobUnderstanding(
  db: Database,
  jobId: string,
  context: JobMatchingContext,
  contextHash: string,
): Promise<JobUnderstanding> {
  const cached = await db.from("job_ai_understandings")
    .select("understanding,provider,model")
    .eq("context_hash", contextHash)
    .eq("analysis_version", JOB_AI_UNDERSTANDING_VERSION)
    .maybeSingle();
  if (cached.error) throw cached.error;

  if (cached.data?.understanding) {
    try {
      const parsed = parseJobUnderstanding(context, cached.data.understanding);
      console.info("[AI job matching] Reusing cached job understanding", { jobId });
      return parsed;
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown cache validation error";
      console.warn("[AI job matching] Cached understanding is invalid; regenerating", {
        jobId, error: detail,
      });
      const { error: deleteError } = await db.from("job_ai_understandings")
        .delete()
        .eq("context_hash", contextHash)
        .eq("analysis_version", JOB_AI_UNDERSTANDING_VERSION);
      if (deleteError) throw deleteError;
    }
  }

  console.info("[AI job matching] Job understanding started", { jobId });
  const generated = await understandJobWithAi(context);
  console.info("[AI job matching] Job understanding completed", {
    jobId, provider: generated.provider, model: generated.model,
  });
  const { error } = await db.from("job_ai_understandings").upsert({
    context_hash: contextHash,
    analysis_version: JOB_AI_UNDERSTANDING_VERSION,
    understanding: generated.analysis,
    provider: generated.provider,
    model: generated.model,
    updated_at: new Date().toISOString(),
  }, { onConflict: "context_hash,analysis_version" });
  if (error) throw error;
  return generated.analysis;
}
