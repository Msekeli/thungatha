import { z } from "zod";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/lib/auth/identity";
import { apiError, apiFailure } from "@/lib/http/api-response";
import { connection, NextResponse } from "next/server";
import {
  createAuthenticatedSupabaseClient,
  createPublicSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";

const idSchema = z.string().uuid();

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await connection();
  let identity: Awaited<ReturnType<typeof getAuthenticatedIdentity>> = null;
  if (hasClerkConfiguration()) {
    try {
      identity = await getAuthenticatedIdentity();
    } catch {
      return apiError("Authentication could not be verified", 503);
    }
  }
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return apiError("Invalid job ID", 400);
  try {
    const db = identity
      ? await createAuthenticatedSupabaseClient(identity.getToken)
      : await createPublicSupabaseClient();
    const jobResult = await db
      .from("jobs")
      .select(
        "id,title,employer_name,description,location_text,country_code,work_mode,employment_type,salary_min,salary_max,salary_currency,updated_at,job_sources!inner(id,provider_key,provider_kind,external_job_id,source_url,application_url,published_at,availability_status)",
      )
      .eq("id", id)
      .eq("job_sources.availability_status", "active")
      .maybeSingle();
    if (jobResult.error) throw jobResult.error;
    if (!jobResult.data) return apiError("Job not found", 404);
    let state: "saved" | "dismissed" | null = null;
    if (identity) {
      const stateResult = await db
        .from("user_job_states")
        .select("state")
        .eq("user_id", identity.userId)
        .eq("job_id", id)
        .maybeSingle();
      if (stateResult.error) throw stateResult.error;
      state = stateResult.data?.state ?? null;
    }
    return NextResponse.json({ job: { ...jobResult.data, state } });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError)
      return apiError("Job storage is not configured", 503);
    return apiFailure(error);
  }
}
