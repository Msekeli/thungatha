import "server-only";

import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { scoutVacancyBatchSchema } from "@/thungatha-features/job-discovery/server/scout-vacancy-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorised(request: Request) {
  const expectedSecret = process.env.SCOUT_INGESTION_SECRET;
  if (!expectedSecret) return false;

  const authorization = request.headers.get("authorization") ?? "";
  const suppliedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const expected = Buffer.from(expectedSecret);
  const supplied = Buffer.from(suppliedSecret);

  return (
    supplied.length === expected.length &&
    timingSafeEqual(supplied, expected)
  );
}

function createScoutDatabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Scout vacancy storage is not configured.");
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Receives approved vacancies from Thungatha Scout.
 * Scout owns source retrieval and HTML sanitisation; this endpoint validates
 * the exact contract and persists the supplied description without rewriting it.
 */
export async function POST(request: Request) {
  if (!process.env.SCOUT_INGESTION_SECRET) {
    return NextResponse.json(
      { error: "Scout integration is not configured." },
      { status: 503 },
    );
  }

  if (!isAuthorised(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = scoutVacancyBatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Scout vacancy payload failed contract validation.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  try {
    const db = createScoutDatabaseClient();
    const rows = parsed.data.map((vacancy) => ({
      scout_vacancy_id: vacancy.scoutVacancyId,
      title: vacancy.jobTitle,
      employer_name: vacancy.companyName,
      company_logo_url: vacancy.companyLogoUrl,
      location_text: vacancy.location,
      description: vacancy.description,
      application_url: vacancy.applicationUrl,
      published_at: vacancy.publishedAt,
      source_updated_at: vacancy.updatedAt,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await db
      .from("jobs")
      .upsert(rows, { onConflict: "scout_vacancy_id" });

    if (error) throw error;

    return NextResponse.json({
      accepted: rows.length,
    });
  } catch (error) {
    console.error("[Scout vacancy receiver] Persistence failed:", {
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json(
      { error: "Scout vacancies could not be stored." },
      { status: 500 },
    );
  }
}
