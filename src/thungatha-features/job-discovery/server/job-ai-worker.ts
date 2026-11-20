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

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server-side secret configuration is missing.");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

function hashDescription(description: string) {
  return createHash("sha256").update(description).digest("hex");
}

type QueueTask = {
  id: string;
  user_id: string;
  job_id: string;
  profile_version: number;
  job_description_hash: string;
  assessment_version: string;
  attempts: number;
};

async function completeTask(db: ReturnType<typeof createServiceClient>, id: string) {
  const { error } = await db.from("ai_task_queue").update({
    status: "completed", locked_at: null, last_error: null, updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw error;
}

async function processTask(db: ReturnType<typeof createServiceClient>, task: QueueTask) {
  if (task.assessment_version !== JOB_AI_ASSESSMENT_VERSION) {
    await completeTask(db, task.id);
    return "stale";
  }

  const [jobResult, profileResult] = await Promise.all([
    db.from("jobs").select("id,title,description").eq("id", task.job_id).maybeSingle(),
    db.from("profiles").select(PROFILE_SELECT_COLUMNS).eq("user_id", task.user_id).maybeSingle(),
  ]);
  if (jobResult.error) throw jobResult.error;
  if (profileResult.error) throw profileResult.error;
  const job = jobResult.data;
  const profileRow = profileResult.data as ProfileDatabaseRow | null;

  if (!job || !profileRow) {
    await completeTask(db, task.id);
    return "stale";
  }

  const description = job.description ?? "";
  if (hashDescription(description) !== task.job_description_hash) {
    await completeTask(db, task.id);
    return "stale";
  }

  const profile = mapRowToProfileDto(profileRow);
  const candidateFacts = deriveCandidateFacts(profile);
  if (!candidateFacts || candidateFacts.profileVersion !== task.profile_version) {
    await completeTask(db, task.id);
    return "stale";
  }

  const understandingResult = await db.from("job_ai_understandings")
    .select("understanding,provider,model")
    .eq("job_id", task.job_id)
    .eq("description_hash", task.job_description_hash)
    .eq("analysis_version", JOB_AI_ASSESSMENT_VERSION)
    .maybeSingle();
  if (understandingResult.error) throw understandingResult.error;

  let understanding = understandingResult.data?.understanding;
  if (!understanding) {
    const generated = await understandJobWithAi(job.title, description);
    understanding = generated.analysis;
    const { error } = await db.from("job_ai_understandings").upsert({
      job_id: task.job_id,
      description_hash: task.job_description_hash,
      analysis_version: JOB_AI_ASSESSMENT_VERSION,
      understanding: generated.analysis,
      provider: generated.provider,
      model: generated.model,
      updated_at: new Date().toISOString(),
    }, { onConflict: "job_id" });
    if (error) throw error;
  }

  const parsedUnderstanding = jobUnderstandingSchema.parse(understanding);
  const generatedAssessment = await assessJobWithAi(
    job.title, parsedUnderstanding, description, candidateFacts,
  );
  const { error: saveError } = await db.from("job_match_assessments").upsert({
    user_id: task.user_id,
    job_id: task.job_id,
    profile_version: task.profile_version,
    job_description_hash: task.job_description_hash,
    assessment_version: JOB_AI_ASSESSMENT_VERSION,
    classification: generatedAssessment.assessment.classification,
    assessment: generatedAssessment.assessment,
    provider: generatedAssessment.provider,
    model: generatedAssessment.model,
  }, {
    onConflict: "user_id,job_id,profile_version,job_description_hash,assessment_version",
  });
  if (saveError) throw saveError;

  await completeTask(db, task.id);
  return "processed";
}

export async function processJobAiQueue(maxTasks = 1) {
  const db = createServiceClient();
  const summary = { processed: 0, stale: 0, failed: 0 };
  for (let index = 0; index < Math.max(1, Math.min(maxTasks, 5)); index += 1) {
    const { data, error } = await db.rpc("claim_ai_job_matching_task");
    if (error) throw error;
    const task = (data?.[0] ?? null) as QueueTask | null;
    if (!task) break;

    try {
      const result = await processTask(db, task);
      if (result === "stale") summary.stale += 1;
      else summary.processed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown AI task failure";
      const terminal = task.attempts >= 4;
      const delayMinutes = Math.min(60, 2 ** task.attempts);
      const { error: updateError } = await db.from("ai_task_queue").update({
        status: terminal ? "failed" : "pending",
        available_at: new Date(Date.now() + delayMinutes * 60_000).toISOString(),
        locked_at: null,
        last_error: message.slice(0, 1000),
        updated_at: new Date().toISOString(),
      }).eq("id", task.id);
      if (updateError) throw updateError;
      summary.failed += 1;
    }
  }
  return summary;
}
