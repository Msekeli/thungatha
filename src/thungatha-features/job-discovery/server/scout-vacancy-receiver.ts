import "server-only";

import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { ScoutVacancy } from "./scout-vacancy-schema";

export function isScoutReceiverConfigured() {
  return Boolean(process.env.SCOUT_INGESTION_SECRET);
}

export function isAuthorisedScoutRequest(request: Request) {
  const expectedSecret = process.env.SCOUT_INGESTION_SECRET;
  if (!expectedSecret) return false;
  const authorization = request.headers.get("authorization") ?? "";
  const suppliedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const expected = Buffer.from(expectedSecret);
  const supplied = Buffer.from(suppliedSecret);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function persistScoutVacancies(vacancies: ScoutVacancy[]) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Scout vacancy storage is not configured.");
  }

  const db = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
  const rows = vacancies.map((vacancy) => ({
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
  return rows.length;
}
