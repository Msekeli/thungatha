import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, apiFailure } from "@/lib/http/api-response";
import {
  createAuthenticatedSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";
import { resolveJobDiscoveryUser } from "@/thungatha-features/job-discovery/server/job-discovery-identity";

const idSchema = z.string().uuid();
const bodySchema = z
  .object({
    state: z.enum(["saved", "dismissed"]),
    scope: z.enum(["job", "employer"]).optional(),
  })
  .strict();

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return apiError("Invalid job ID", 400);
  const { user, response } = await resolveJobDiscoveryUser();
  if (response) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return apiError("State must be saved or dismissed", 400);

  try {
    const db = await createAuthenticatedSupabaseClient(user!.getToken);
    const { data: job, error: jobError } = await db
      .from("jobs")
      .select("id,employer_name,employer_key")
      .eq("id", id)
      .not("scout_vacancy_id", "is", null)
      .maybeSingle();
    if (jobError) throw jobError;
    if (!job) return apiError("Job not found", 404);

    if (parsed.data.state === "dismissed" && parsed.data.scope === "employer") {
      if (!job.employer_name?.trim() || !job.employer_key?.trim())
        return apiError("An employer name is not available for this job", 422);
      const { error: employerError } = await db
        .from("user_employer_dismissals")
        .upsert(
          {
            user_id: user!.userId,
            employer_key: job.employer_key,
            employer_name: job.employer_name.trim(),
          },
          { onConflict: "user_id,employer_key" },
        );
      if (employerError) throw employerError;
    }

    if (parsed.data.state === "saved" && job.employer_key) {
      const { error: employerError } = await db
        .from("user_employer_dismissals")
        .delete()
        .eq("user_id", user!.userId)
        .eq("employer_key", job.employer_key);
      if (employerError) throw employerError;
    }

    const { data, error } = await db
      .from("user_job_states")
      .upsert(
        { user_id: user!.userId, job_id: id, state: parsed.data.state },
        { onConflict: "user_id,job_id" },
      )
      .select("job_id,state,updated_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ state: data });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return apiError("Job storage is not configured", 503);
    }
    return apiFailure(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return apiError("Invalid job ID", 400);
  const { user, response } = await resolveJobDiscoveryUser();
  if (response) return response;

  try {
    const db = await createAuthenticatedSupabaseClient(user!.getToken);
    const { data: job, error: jobError } = await db
      .from("jobs")
      .select("employer_key")
      .eq("id", id)
      .maybeSingle();
    if (jobError) throw jobError;

    const { error } = await db
      .from("user_job_states")
      .delete()
      .eq("user_id", user!.userId)
      .eq("job_id", id);
    if (error) throw error;

    if (job?.employer_key) {
      const { error: employerError } = await db
        .from("user_employer_dismissals")
        .delete()
        .eq("user_id", user!.userId)
        .eq("employer_key", job.employer_key);
      if (employerError) throw employerError;
    }
    return NextResponse.json({ state: null });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return apiError("Job storage is not configured", 503);
    }
    return apiFailure(error);
  }
}
