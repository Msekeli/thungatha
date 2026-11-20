import "server-only";

import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const JOB_AI_ASSESSMENT_VERSION = "m3-ai-v1";

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

export async function enqueueVisibleJobAssessments(userId: string, jobIds: string[]) {
  const uniqueIds = [...new Set(jobIds)].filter(Boolean);
  if (!uniqueIds.length) return 0;

  const db = createServiceClient();
  const profileResult = await db.from("profiles")
    .select("profile_version,confirmed_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (profileResult.error) throw profileResult.error;
  const profile = profileResult.data;
  if (!profile?.confirmed_at) return 0;

  const jobsResult = await db.from("jobs")
    .select("id,description")
    .in("id", uniqueIds);
  if (jobsResult.error) throw jobsResult.error;

  const tasks = (jobsResult.data ?? []).map((job) => {
    const hash = hashDescription(job.description ?? "");
    const profileVersion = profile.profile_version ?? 1;
    const dedupeKey = [
      userId, job.id, profileVersion, hash, JOB_AI_ASSESSMENT_VERSION,
    ].join(":");
    return {
      dedupe_key: dedupeKey,
      task_type: "job_fit_assessment",
      user_id: userId,
      job_id: job.id,
      profile_version: profileVersion,
      job_description_hash: hash,
      assessment_version: JOB_AI_ASSESSMENT_VERSION,
    };
  });
  if (!tasks.length) return 0;

  const { error } = await db.from("ai_task_queue")
    .upsert(tasks, { onConflict: "dedupe_key", ignoreDuplicates: true });
  if (error) throw error;
  return tasks.length;
}


export async function getJobAiTaskStatus(input: {
  userId: string;
  jobId: string;
  profileVersion: number;
  descriptionHash: string;
}): Promise<"pending" | "processing" | "failed" | "completed" | null> {
  const db = createServiceClient();
  const { data, error } = await db.from("ai_task_queue")
    .select("status")
    .eq("task_type", "job_fit_assessment")
    .eq("user_id", input.userId)
    .eq("job_id", input.jobId)
    .eq("profile_version", input.profileVersion)
    .eq("job_description_hash", input.descriptionHash)
    .eq("assessment_version", JOB_AI_ASSESSMENT_VERSION)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data?.status as "pending" | "processing" | "failed" | "completed" | undefined) ?? null;
}


export async function retryFailedJobAiTask(input: {
  userId: string;
  jobId: string;
  profileVersion: number;
  descriptionHash: string;
}): Promise<boolean> {
  const db = createServiceClient();
  const { data, error } = await db.from("ai_task_queue")
    .update({
      status: "pending",
      attempts: 0,
      available_at: new Date().toISOString(),
      locked_at: null,
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("task_type", "job_fit_assessment")
    .eq("user_id", input.userId)
    .eq("job_id", input.jobId)
    .eq("profile_version", input.profileVersion)
    .eq("job_description_hash", input.descriptionHash)
    .eq("assessment_version", JOB_AI_ASSESSMENT_VERSION)
    .eq("status", "failed")
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
