import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, apiFailure } from "@/lib/http/api-response";
import {
  createAuthenticatedSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";
import { resolveJobDiscoveryUser } from "@/thungatha-features/job-discovery/server/job-discovery-identity";
import {
  readUserJobActivity,
  recordUserJobActivity,
} from "@/thungatha-features/job-discovery/server/job-activity-repository";

const idSchema = z.string().uuid();
const bodySchema = z
  .object({ action: z.enum(["opened_application", "confirm_applied"]) })
  .strict();

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await resolveJobDiscoveryUser();
  if (response) return response;
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return apiError("Invalid job ID", 400);

  try {
    const db = await createAuthenticatedSupabaseClient(user!.getToken);
    const activity = await readUserJobActivity(db, user!.userId, id);
    return NextResponse.json({ activity });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return apiError("Job storage is not configured", 503);
    }
    return apiFailure(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await resolveJobDiscoveryUser();
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
    const result = await recordUserJobActivity(
      db,
      user!.userId,
      id,
      parsed.data.action,
    );
    if (result.status === "not-found") return apiError("Job not found", 404);
    if (result.status === "application-url-missing") {
      return apiError("No application destination is available", 409);
    }
    return NextResponse.json({ activity: result.activity });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return apiError("Job storage is not configured", 503);
    }
    return apiFailure(error);
  }
}
