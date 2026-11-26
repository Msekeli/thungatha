import "server-only";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { buildJobEvidence } from "./job-ai-evidence";

export const JOB_AI_UNDERSTANDING_VERSION = "m3-understanding-v6";
export const JOB_AI_ASSESSMENT_VERSION = "m3-ai-v8";

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error("Supabase server-side secret configuration is missing.");
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export type JobMatchingContext = {
  title: string;
  employerName: string | null;
  locationText: string | null;
  description: string;
};

export function createJobMatchingContext(input: {
  title?: string | null;
  employer_name?: string | null;
  location_text?: string | null;
  description?: string | null;
}): JobMatchingContext {
  return {
    title: input.title?.trim() ?? "",
    employerName: input.employer_name?.trim() || null,
    locationText: input.location_text?.trim() || null,
    description: input.description ?? "",
  };
}

export function hashJobContext(context: JobMatchingContext) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        title: context.title,
        employerName: context.employerName,
        locationText: context.locationText,
        description: context.description,
      }),
    )
    .digest("hex");
}

export function hashDescription(description: string) {
  return createHash("sha256").update(description).digest("hex");
}

export function isUsableJobDescription(
  description: string | null | undefined,
): boolean {
  if (!description || typeof description !== "string") return false;
  const trimmed = description.trim();
  return buildJobEvidence(trimmed).length > 0;
}

export async function getConfirmedProfileVersion(userId: string) {
  const { data, error } = await createServiceClient()
    .from("profiles")
    .select("profile_version,confirmed_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data?.confirmed_at) return null;
  return data.profile_version ?? 1;
}

export async function getJobAiTaskStatus(input: {
  userId: string;
  jobId: string;
  profileVersion: number;
  contextHash: string;
}): Promise<
  "pending" | "processing" | "failed" | "completed" | "unavailable" | null
> {
  const { data, error } = await createServiceClient()
    .from("ai_task_queue")
    .select("status")
    .eq("task_type", "job_fit_assessment")
    .eq("user_id", input.userId)
    .eq("job_id", input.jobId)
    .eq("profile_version", input.profileVersion)
    .eq("job_context_hash", input.contextHash)
    .eq("assessment_version", JOB_AI_ASSESSMENT_VERSION)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (
    (data?.status as
      | "pending"
      | "processing"
      | "failed"
      | "completed"
      | "unavailable"
      | undefined) ?? null
  );
}

export async function requeueCompletedJobAiTask(input: {
  userId: string;
  jobId: string;
  profileVersion: number;
  contextHash: string;
}): Promise<boolean> {
  const now = new Date().toISOString();
  const { data, error } = await createServiceClient()
    .from("ai_task_queue")
    .update({
      status: "pending",
      attempts: 0,
      available_at: now,
      locked_at: null,
      last_error:
        "Completed task had no persisted assessment; queued for recovery.",
      updated_at: now,
    })
    .eq("task_type", "job_fit_assessment")
    .eq("user_id", input.userId)
    .eq("job_id", input.jobId)
    .eq("profile_version", input.profileVersion)
    .eq("job_context_hash", input.contextHash)
    .eq("assessment_version", JOB_AI_ASSESSMENT_VERSION)
    .eq("status", "completed")
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function retryFailedJobAiTask(input: {
  userId: string;
  jobId: string;
  profileVersion: number;
  contextHash: string;
}): Promise<boolean> {
  const now = new Date().toISOString();
  const { data, error } = await createServiceClient()
    .from("ai_task_queue")
    .update({
      status: "pending",
      attempts: 0,
      available_at: now,
      locked_at: null,
      last_error: null,
      updated_at: now,
    })
    .eq("task_type", "job_fit_assessment")
    .eq("user_id", input.userId)
    .eq("job_id", input.jobId)
    .eq("profile_version", input.profileVersion)
    .eq("job_context_hash", input.contextHash)
    .eq("assessment_version", JOB_AI_ASSESSMENT_VERSION)
    .in("status", ["failed", "completed"])
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
