import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedIdentity, hasClerkConfiguration } from "@/lib/auth/identity";
import { apiError, apiFailure } from "@/lib/http/api-response";
import { createAuthenticatedSupabaseClient, SupabaseConfigurationError } from "@/lib/supabase/server";

const idSchema = z.string().uuid();
const bodySchema = z.object({ state: z.enum(["saved", "dismissed"]) }).strict();

export const dynamic = "force-dynamic";

async function resolveUser() {
  if (!hasClerkConfiguration()) return { user: null, response: apiError("Authentication is not configured", 503) };
  try {
    const user = await getAuthenticatedIdentity();
    if (!user) return { user: null, response: apiError("Authentication required", 401) };
    return { user, response: null };
  } catch { return { user: null, response: apiError("Authentication could not be verified", 503) }; }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await resolveUser();
  if (response) return response;
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return apiError("Invalid job ID", 400);
  let body: unknown;
  try { body = await request.json(); } catch { return apiError("Invalid JSON body", 400); }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return apiError("State must be saved or dismissed", 400);
  try {
    const db = await createAuthenticatedSupabaseClient(user!.getToken);
    const { data: job, error: jobError } = await db.from("jobs").select("id,job_sources!inner(availability_status)").eq("id", id).eq("job_sources.availability_status", "active").maybeSingle();
    if (jobError) throw jobError;
    if (!job) return apiError("Job not found", 404);
    const { data, error } = await db.from("user_job_states").upsert(
      { user_id: user!.userId, job_id: id, state: parsed.data.state },
      { onConflict: "user_id,job_id" },
    ).select("job_id,state,updated_at").single();
    if (error) throw error;
    return NextResponse.json({ state: data });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) return apiError("Job storage is not configured", 503);
    return apiFailure(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await resolveUser();
  if (response) return response;
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return apiError("Invalid job ID", 400);
  try {
    const db = await createAuthenticatedSupabaseClient(user!.getToken);
    const { error } = await db.from("user_job_states").delete().eq("user_id", user!.userId).eq("job_id", id);
    if (error) throw error;
    return NextResponse.json({ state: null });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) return apiError("Job storage is not configured", 503);
    return apiFailure(error);
  }
}
