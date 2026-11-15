import { z } from "zod";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/thungatha-features/authentication/server/identity";
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
    const { data, error } = await db
      .from("jobs")
      .select(
        "id,scout_vacancy_id,title,employer_name,company_logo_url,description,location_text,application_url,published_at,source_updated_at,updated_at",
      )
      .eq("id", id)
      .not("scout_vacancy_id", "is", null)
      .maybeSingle();

    if (error) throw error;
    if (!data) return apiError("Job not found", 404);

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

    return NextResponse.json({ job: { ...data, state } });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return apiError("Job storage is not configured", 503);
    }
    return apiFailure(error);
  }
}
