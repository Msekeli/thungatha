import "server-only";
import { mapRowToProfileDto } from "@/thungatha-features/user-profile/server/user-profile-mapper";
import type { ProfileDatabaseRow } from "@/thungatha-features/user-profile/server/profile-database-row";
import { PROFILE_SELECT_COLUMNS } from "@/thungatha-features/user-profile/server/repository";
import { deriveCandidateFacts } from "@/thungatha-features/user-profile/server/candidate-facts";
import { assessJobWithAi, understandJobWithAi } from "./job-ai-service";
import { jobUnderstandingSchema } from "./job-ai-schemas";
import {
  JOB_AI_ASSESSMENT_VERSION, createServiceClient, hashDescription, isUsableJobDescription,
} from "./job-ai-queue-eligibility";

export type QueueTask = {
  id: string; user_id: string; job_id: string; profile_version: number;
  job_description_hash: string; assessment_version: string; attempts: number;
};

export const createJobAiClient = createServiceClient;

async function completeTask(db: ReturnType<typeof createServiceClient>, id: string) {
  const { error } = await db.from("ai_task_queue").update({
    status: "completed", locked_at: null, last_error: null, updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw error;
}

export async function processJobAiTask(db: ReturnType<typeof createServiceClient>, task: QueueTask) {
  if (task.assessment_version !== JOB_AI_ASSESSMENT_VERSION) { await completeTask(db, task.id); return "stale"; }
  const [jobResult, profileResult] = await Promise.all([
    db.from("jobs").select("id,title,description").eq("id", task.job_id).maybeSingle(),
    db.from("profiles").select(PROFILE_SELECT_COLUMNS).eq("user_id", task.user_id).maybeSingle(),
  ]);
  if (jobResult.error) throw jobResult.error;
  if (profileResult.error) throw profileResult.error;
  const job = jobResult.data;
  const row = profileResult.data as ProfileDatabaseRow | null;
  if (!job || !row) { await completeTask(db, task.id); return "stale"; }
  const description = job.description ?? "";
  if (!isUsableJobDescription(description) || hashDescription(description) !== task.job_description_hash) {
    await completeTask(db, task.id); return "stale";
  }
  const facts = deriveCandidateFacts(mapRowToProfileDto(row));
  if (!facts || facts.profileVersion !== task.profile_version) { await completeTask(db, task.id); return "stale"; }
  const cached = await db.from("job_ai_understandings").select("understanding,provider,model")
    .eq("job_id", task.job_id).eq("description_hash", task.job_description_hash)
    .eq("analysis_version", JOB_AI_ASSESSMENT_VERSION).maybeSingle();
  if (cached.error) throw cached.error;
  let understanding = cached.data?.understanding;
  if (!understanding) {
    const generated = await understandJobWithAi(job.title, description);
    understanding = generated.analysis;
    const { error } = await db.from("job_ai_understandings").upsert({
      job_id: task.job_id, description_hash: task.job_description_hash,
      analysis_version: JOB_AI_ASSESSMENT_VERSION, understanding: generated.analysis,
      provider: generated.provider, model: generated.model, updated_at: new Date().toISOString(),
    }, { onConflict: "job_id" });
    if (error) throw error;
  }
  const parsed = jobUnderstandingSchema.parse(understanding);
  const generated = await assessJobWithAi(job.title, parsed, description, facts);
  const { data: persisted, error: persistError } = await db.rpc("persist_job_match_assessment", {
    p_task_id: task.id,
    p_user_id: task.user_id,
    p_job_id: task.job_id,
    p_profile_version: task.profile_version,
    p_profile_confirmed_at: facts.confirmedAt,
    p_job_description_hash: task.job_description_hash,
    p_job_description: description,
    p_assessment_version: task.assessment_version,
    p_classification: generated.assessment.classification,
    p_assessment: generated.assessment,
    p_provider: generated.provider,
    p_model: generated.model,
  });
  if (persistError) throw persistError;
  if (!persisted) return "stale";
  return "processed";
}
