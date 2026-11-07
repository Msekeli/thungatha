import "server-only";

import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { scoutExportPageSchema } from "@/thungatha-features/job-discovery/server/scout-export-schema";


function isAuthorised(request: Request) {
  const expectedSecret = process.env.SCOUT_SYNC_SECRET;
  if (!expectedSecret) return false;
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const expectedBytes = Buffer.from(expectedSecret);
  const suppliedBytes = Buffer.from(supplied);
  return suppliedBytes.length === expectedBytes.length && timingSafeEqual(suppliedBytes, expectedBytes);
}

export async function POST(request: Request) {
  if (!isAuthorised(request)) {
    return NextResponse.json({ error: "A valid Thungatha sync secret is required." }, { status: 401 });
  }

  const parsed = scoutExportPageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Scout import payload failed validation." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Thungatha server-side Supabase credentials are not configured." }, { status: 503 });
  }

  try {
    const database = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });
    const rows = parsed.data.items.map((vacancy) => ({
      scout_vacancy_id: vacancy.scout_vacancy_id,
      title: vacancy.title,
      employer_name: vacancy.employer_name,
      company_logo_url: vacancy.logo_url,
      description: vacancy.description,
      location_text: vacancy.location_text,
      application_url: vacancy.application_url,
      published_at: vacancy.published_at,
      source_updated_at: vacancy.source_updated_at,
      updated_at: new Date().toISOString(),
    }));

    if (rows.length > 0) {
      const { error } = await database.from("jobs").upsert(rows, { onConflict: "scout_vacancy_id" });
      if (error) throw error;
    }
    return NextResponse.json({ success: true, received: rows.length, stored: rows.length });
  } catch (error) {
    const databaseError = error && typeof error === "object"
      ? error as { code?: string; message?: string; details?: string; hint?: string }
      : null;
    console.error("[Scout vacancy import] Persistence failed:", {
      errorName: error instanceof Error ? error.name : "unknown",
      code: databaseError?.code ?? null,
      message: databaseError?.message ?? (error instanceof Error ? error.message : "Unknown error"),
      details: databaseError?.details ?? null,
      hint: databaseError?.hint ?? null,
    });
    return NextResponse.json({
      error: "Thungatha could not persist the imported vacancies.",
      diagnostic: {
        code: databaseError?.code ?? null,
        message: databaseError?.message ?? (error instanceof Error ? error.message : "Unknown error"),
        details: databaseError?.details ?? null,
        hint: databaseError?.hint ?? null,
      },
    }, { status: 500 });
  }
}
