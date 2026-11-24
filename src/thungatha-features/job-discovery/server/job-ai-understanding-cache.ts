import "server-only";
import {
  JOB_AI_UNDERSTANDING_VERSION,
  createServiceClient,
  hashJobContext,
} from "./job-ai-queue-eligibility";
import {
  parseJobUnderstanding,
  understandJobWithAi,
} from "./job-ai-service";
import type { JobMatchingContext } from "./job-ai-queue-eligibility";

export async function getOrCreateJobUnderstanding(
  context: JobMatchingContext,
) {
  const db = createServiceClient();
  const contextHash = hashJobContext(context);
  const cached = await db
    .from("job_ai_understandings")
    .select("understanding,provider,model")
    .eq("context_hash", contextHash)
    .eq("analysis_version", JOB_AI_UNDERSTANDING_VERSION)
    .maybeSingle();
  if (cached.error) throw cached.error;

  if (cached.data?.understanding) {
    try {
      return {
        analysis: parseJobUnderstanding(context, cached.data.understanding),
        provider: cached.data.provider,
        model: cached.data.model,
        reused: true,
      };
    } catch {
      const { error } = await db
        .from("job_ai_understandings")
        .delete()
        .eq("context_hash", contextHash)
        .eq("analysis_version", JOB_AI_UNDERSTANDING_VERSION);
      if (error) throw error;
    }
  }

  const generated = await understandJobWithAi(context);
  const { error } = await db.from("job_ai_understandings").upsert(
    {
      context_hash: contextHash,
      analysis_version: JOB_AI_UNDERSTANDING_VERSION,
      understanding: generated.analysis,
      provider: generated.provider,
      model: generated.model,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "context_hash,analysis_version" },
  );
  if (error) throw error;
  return { ...generated, reused: false };
}
