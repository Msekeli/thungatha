import { z } from "zod";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/lib/auth/identity";
import { apiError, apiFailure } from "@/lib/http/api-response";
import { NextResponse } from "next/server";
import {
  createAuthenticatedSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";

const idSchema = z.string().uuid();

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!hasClerkConfiguration())
    return apiError("Authentication is not configured", 503);
  let identity: Awaited<ReturnType<typeof getAuthenticatedIdentity>>;
  try {
    identity = await getAuthenticatedIdentity();
  } catch {
    return apiError("Authentication could not be verified", 503);
  }
  if (!identity) return apiError("Authentication required", 401);
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return apiError("Invalid job ID", 400);
  try {
    const db = await createAuthenticatedSupabaseClient(identity.getToken);
    const [jobResult, stateResult] = await Promise.all([
      db
        .from("jobs")
        .select(
          "id,title,employer_name,description,location_text,country_code,work_mode,employment_type,salary_min,salary_max,salary_currency,updated_at,job_sources!inner(id,provider_key,provider_kind,external_job_id,source_url,application_url,published_at,availability_status)",
        )
        .eq("id", id)
        .eq("job_sources.availability_status", "active")
        .maybeSingle(),
      db
        .from("user_job_states")
        .select("state")
        .eq("user_id", identity.userId)
        .eq("job_id", id)
        .maybeSingle(),
    ]);
    if (jobResult.error) throw jobResult.error;
    if (stateResult.error) throw stateResult.error;
    if (!jobResult.data) return apiError("Job not found", 404);
    return NextResponse.json({
      job: { ...jobResult.data, state: stateResult.data?.state ?? null },
    });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError)
      return apiError("Job storage is not configured", 503);
    return apiFailure(error);
  }
}
