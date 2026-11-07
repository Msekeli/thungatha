import type { SupabaseClient } from "@supabase/supabase-js";

export type JobActivityAction = "opened_application" | "confirm_applied";

export async function readUserJobActivity(
  db: SupabaseClient,
  userId: string,
  jobId: string,
) {
  const { data, error } = await db
    .from("user_job_activity")
    .select("application_link_opened_at,applied_at")
    .eq("user_id", userId)
    .eq("job_id", jobId)
    .maybeSingle();
  if (error) throw error;
  return data ?? { application_link_opened_at: null, applied_at: null };
}

export async function recordUserJobActivity(
  db: SupabaseClient,
  userId: string,
  jobId: string,
  action: JobActivityAction,
) {
  const { data: job, error: jobError } = await db
    .from("jobs")
    .select("id,application_url")
    .eq("id", jobId)
    .not("scout_vacancy_id", "is", null)
    .maybeSingle();
  if (jobError) throw jobError;
  if (!job) return { status: "not-found" as const };
  if (
    action === "opened_application" &&
    !(
      typeof job.application_url === "string" &&
      /^https?:\/\//i.test(job.application_url)
    )
  ) {
    return { status: "application-url-missing" as const };
  }

  const existing = await readUserJobActivity(db, userId, jobId);
  const now = new Date().toISOString();
  const activity = {
    user_id: userId,
    job_id: jobId,
    application_link_opened_at:
      action === "opened_application"
        ? now
        : (existing.application_link_opened_at ?? null),
    applied_at:
      action === "confirm_applied"
        ? (existing.applied_at ?? now)
        : (existing.applied_at ?? null),
    updated_at: now,
  };
  const { data, error } = await db
    .from("user_job_activity")
    .upsert(activity, { onConflict: "user_id,job_id" })
    .select("application_link_opened_at,applied_at")
    .single();
  if (error) throw error;
  return { status: "saved" as const, activity: data };
}
