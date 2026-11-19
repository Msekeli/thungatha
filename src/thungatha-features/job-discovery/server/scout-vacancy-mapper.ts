import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScoutExportVacancy } from "./scout-export-schema";
import {
  extractJobRequirements,
  hashJobDescription,
} from "./job-requirement-extractor";

export async function mapScoutVacancies(
  database: SupabaseClient,
  vacancies: ScoutExportVacancy[],
) {
  if (vacancies.length === 0) return [];
  const ids = vacancies.map((vacancy) => vacancy.scout_vacancy_id);
  const existing = await database
    .from("jobs")
    .select("scout_vacancy_id,extracted_requirements,requirements_description_hash,requirements_extraction_version,requirements_extraction_status")
    .in("scout_vacancy_id", ids);
  if (existing.error) throw existing.error;

  const byId = new Map(
    (existing.data ?? []).map((job) => [job.scout_vacancy_id, job]),
  );
  return vacancies.map((vacancy) => {
    const previous = byId.get(vacancy.scout_vacancy_id);
    const hash = hashJobDescription(vacancy.description);
    const unchanged = previous?.requirements_description_hash === hash;
    const extraction = unchanged
      ? null
      : extractJobRequirements(vacancy.description, vacancy.title);

    return {
      scout_vacancy_id: vacancy.scout_vacancy_id,
      title: vacancy.title,
      employer_name: vacancy.employer_name,
      company_logo_url: vacancy.logo_url,
      description: vacancy.description,
      location_text: vacancy.location_text,
      application_url: vacancy.application_url,
      published_at: vacancy.published_at,
      source_updated_at: vacancy.source_updated_at,
      extracted_requirements: extraction ?? previous?.extracted_requirements,
      requirements_description_hash: hash,
      requirements_extraction_version: extraction?.extractionVersion ?? previous?.requirements_extraction_version,
      requirements_extraction_status: extraction?.status ?? previous?.requirements_extraction_status,
      updated_at: new Date().toISOString(),
    };
  });
}
