import { connection, NextResponse } from "next/server";
import { z } from "zod";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/lib/auth/identity";
import { apiError, apiFailure } from "@/lib/http/api-response";
import {
  createAuthenticatedSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";

const idSchema = z.string().uuid();
const bodySchema = z
  .object({ action: z.enum(["opened_application", "confirm_applied"]) })
  .strict();

async function resolveUser() {
  await connection();
  if (!hasClerkConfiguration())
    return {
      user: null,
      response: apiError("Authentication is not configured", 503),
    };
  try {
    const user = await getAuthenticatedIdentity();
    if (!user)
      return { user: null, response: apiError("Authentication required", 401) };
    return { user, response: null };
  } catch {
    return {
      user: null,
      response: apiError("Authentication could not be verified", 503),
    };
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await resolveUser();
  if (response) return response;
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return apiError("Invalid job ID", 400);
  try {
    const db = await createAuthenticatedSupabaseClient(user!.getToken);
    const { data, error } = await db
      .from("user_job_activity")
      .select("application_link_opened_at,applied_at")
      .eq("user_id", user!.userId)
      .eq("job_id", id)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({
      activity: data ?? { application_link_opened_at: null, applied_at: null },
    });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError)
      return apiError("Job storage is not configured", 503);
    return apiFailure(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await resolveUser();
  if (response) return response;
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return apiError("Invalid job ID", 400);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return apiError("Unsupported activity action", 400);

  try {
    const db = await createAuthenticatedSupabaseClient(user!.getToken);
    const { data: job, error: jobError } = await db
      .from("jobs")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (jobError) throw jobError;
    if (!job) return apiError("Job not found", 404);

    if (parsed.data.action === "opened_application") {
      const { data: sources, error: sourceError } = await db
        .from("job_sources")
        .select("application_url,source_url,availability_status")
        .eq("job_id", id)
        .eq("availability_status", "active");
      if (sourceError) throw sourceError;
      // Job Discovery falls back to the source listing when a provider has no
      // dedicated application URL, so both supported destinations count.
      if (
        !(sources ?? []).some((source) =>
          [source.application_url, source.source_url].some(
            (url) => typeof url === "string" && /^https?:\/\//i.test(url),
          ),
        )
      ) {
        return apiError("No active application destination is available", 409);
      }
    }

    const { data: existing, error: existingError } = await db
      .from("user_job_activity")
      .select("application_link_opened_at,applied_at")
      .eq("user_id", user!.userId)
      .eq("job_id", id)
      .maybeSingle();
    if (existingError) throw existingError;
    const now = new Date().toISOString();
    const activity = {
      user_id: user!.userId,
      job_id: id,
      application_link_opened_at:
        parsed.data.action === "opened_application"
          ? now
          : (existing?.application_link_opened_at ?? null),
      applied_at:
        parsed.data.action === "confirm_applied"
          ? (existing?.applied_at ?? now)
          : (existing?.applied_at ?? null),
      updated_at: now,
    };
    const { data, error } = await db
      .from("user_job_activity")
      .upsert(activity, { onConflict: "user_id,job_id" })
      .select("application_link_opened_at,applied_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ activity: data });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError)
      return apiError("Job storage is not configured", 503);
    return apiFailure(error);
  }
}
