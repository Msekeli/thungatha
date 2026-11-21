import "server-only";

import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const JOB_AI_ASSESSMENT_VERSION = "m3-ai-v2";

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

async function enqueueJobRows(
  userId: string,
  profileVersion: number,
  jobs: { id: string; description: string | null }[],
) {
  if (!jobs.length) return 0;
  const tasks = jobs.map((job) => {
    const hash = hashDescription(job.description ?? "");
    return {
      dedupe_key: [userId, job.id, profileVersion, hash, JOB_AI_ASSESSMENT_VERSION].join(":"),
      task_type: "job_fit_assessment",
      user_id: userId,
      job_id: job.id,
      profile_version: profileVersion,
      job_description_hash: hash,
      assessment_version: JOB_AI_ASSESSMENT_VERSION,
    };
  });
  const { data, error } = await createServiceClient().from("ai_task_queue")
    .upsert(tasks, { onConflict: "dedupe_key", ignoreDuplicates: true })
    .select("id");
  if (error) throw error;
  return data?.length ?? 0;
}

async function getConfirmedProfileVersion(userId: string) {
  const { data, error } = await createServiceClient().from("profiles")
    .select("profile_version,confirmed_at").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (!data?.confirmed_at) return null;
  return data.profile_version ?? 1;
}

export async function enqueueVisibleJobAssessments(userId: string, jobIds: string[]) {
  const uniqueIds = [...new Set(jobIds)].filter(Boolean);
  if (!uniqueIds.length) return 0;
  const profileVersion = await getConfirmedProfileVersion(userId);
  if (profileVersion === null) return 0;
  const { data, error } = await createServiceClient().from("jobs")
    .select("id,description").in("id", uniqueIds).not("scout_vacancy_id", "is", null);
  if (error) throw error;
  return enqueueJobRows(userId, profileVersion, data ?? []);
}

export async function enqueueAllJobAssessments(userId: string) {
  const profileVersion = await getConfirmedProfileVersion(userId);
  if (profileVersion === null) return { queued: 0, eligible: 0 };
  let queued = 0;
  let eligible = 0;
  const db = createServiceClient();
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await db.from("jobs")
      .select("id,description").not("scout_vacancy_id", "is", null)
      .order("id", { ascending: true }).range(offset, offset + 499);
    if (error) throw error;
    const batch = data ?? [];
    eligible += batch.length;
    queued += await enqueueJobRows(userId, profileVersion, batch);
    if (batch.length < 500) break;
  }
  return { queued, eligible };
}

export async function getJobAiTaskStatus(input: {
  userId: string;
  jobId: string;
  profileVersion: number;
  descriptionHash: string;
}): Promise<"pending" | "processing" | "failed" | "completed" | null> {
  const db = createServiceClient();
  const { data, error } = await db.from("ai_task_queue").select("status")
    .eq("task_type", "job_fit_assessment").eq("user_id", input.userId)
    .eq("job_id", input.jobId).eq("profile_version", input.profileVersion)
    .eq("job_description_hash", input.descriptionHash)
    .eq("assessment_version", JOB_AI_ASSESSMENT_VERSION)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
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
  const { data, error } = await db.from("ai_task_queue").update({
    status: "pending", attempts: 0, available_at: new Date().toISOString(),
    locked_at: null, last_error: null, updated_at: new Date().toISOString(),
  }).eq("task_type", "job_fit_assessment").eq("user_id", input.userId)
    .eq("job_id", input.jobId).eq("profile_version", input.profileVersion)
    .eq("job_description_hash", input.descriptionHash)
    .eq("assessment_version", JOB_AI_ASSESSMENT_VERSION)
    .eq("status", "failed").select("id").maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
