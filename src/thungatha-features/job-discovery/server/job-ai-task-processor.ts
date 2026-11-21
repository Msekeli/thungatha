import "server-only";
import { createClient } from "@supabase/supabase-js";
import { mapRowToProfileDto } from "@/thungatha-features/user-profile/server/user-profile-mapper";
import type { ProfileDatabaseRow } from "@/thungatha-features/user-profile/server/profile-database-row";
import { PROFILE_SELECT_COLUMNS } from "@/thungatha-features/user-profile/server/repository";
import { deriveCandidateFacts } from "@/thungatha-features/user-profile/server/candidate-facts";
import { assessJobWithAi, understandJobWithAi } from "./job-ai-service";
import { jobUnderstandingSchema } from "./job-ai-schemas";
import { JOB_AI_ASSESSMENT_VERSION } from "./job-ai-queue";
import { createHash } from "node:crypto";
import { isAssessmentInputCurrent } from "./job-ai-freshness";

export type QueueTask = {
  id: string; user_id: string; job_id: string; profile_version: number;
  job_description_hash: string; assessment_version: string; attempts: number;
};
function hashDescription(description: string) { return createHash("sha256").update(description).digest("hex"); }
async function completeTask(db: ReturnType<typeof createJobAiClient>, id: string) {
  const { error } = await db.from("ai_task_queue").update({
    status: "completed", locked_at: null, last_error: null, updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw error;
}
export function createJobAiClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server-side secret configuration is missing.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
}
export async function processJobAiTask(db: ReturnType<typeof createJobAiClient>, task: QueueTask) {
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
  if (hashDescription(description) !== task.job_description_hash) { await completeTask(db, task.id); return "stale"; }
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
  const [latestJob, latestProfile] = await Promise.all([
    db.from("jobs").select("description").eq("id", task.job_id).maybeSingle(),
    db.from("profiles").select("profile_version,confirmed_at").eq("user_id", task.user_id).maybeSingle(),
  ]);
  if (latestJob.error) throw latestJob.error;
  if (latestProfile.error) throw latestProfile.error;
  if (!isAssessmentInputCurrent(task, {
    description: latestJob.data?.description ?? null,
    profileVersion: latestProfile.data?.profile_version ?? null,
    confirmedAt: latestProfile.data?.confirmed_at ?? null,
  })) {
    await completeTask(db, task.id);
    return "stale";
  }
  const { error } = await db.from("job_match_assessments").upsert({
    user_id: task.user_id, job_id: task.job_id, profile_version: task.profile_version,
    job_description_hash: task.job_description_hash, assessment_version: JOB_AI_ASSESSMENT_VERSION,
    classification: generated.assessment.classification, assessment: generated.assessment,
    provider: generated.provider, model: generated.model,
  }, { onConflict: "user_id,job_id,profile_version,job_description_hash,assessment_version" });
  if (error) throw error;
  await completeTask(db, task.id);
  return "processed";
}
