import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScoutExportVacancy } from "./scout-export-schema";

function hashDescription(description: string) {
  return createHash("sha256").update(description).digest("hex");
}

export async function mapScoutVacancies(
  database: SupabaseClient,
  vacancies: ScoutExportVacancy[],
) {
  if (vacancies.length === 0) return [];

  return vacancies.map((vacancy) => ({
    scout_vacancy_id: vacancy.scout_vacancy_id,
    title: vacancy.title,
    employer_name: vacancy.employer_name,
    company_logo_url: vacancy.logo_url,
    description: vacancy.description,
    location_text: vacancy.location_text,
    application_url: vacancy.application_url,
    published_at: vacancy.published_at,
    source_updated_at: vacancy.source_updated_at,
    // Legacy deterministic extraction is deliberately cleared. AI understanding
    // and candidate assessments are persisted separately with explicit versions.
    extracted_requirements: null,
    requirements_description_hash: hashDescription(vacancy.description),
    requirements_extraction_version: null,
    requirements_extraction_status: null,
    updated_at: new Date().toISOString(),
  }));
}
