import "server-only";

import { createClient } from "@supabase/supabase-js";
import {
  scoutExportPageSchema,
  type ScoutExportVacancy,
} from "./scout-export-schema";

const EXPORT_PAGE_SIZE = 100;
const REQUEST_TIMEOUT_MS = 45_000;
const SYNC_COOLDOWN_MS = 60_000;

let lastSuccessfulSyncAt = 0;
let activeSync: Promise<{ received: number; stored: number }> | null = null;

function readScoutConfiguration() {
  const baseUrl = process.env.SCOUT_API_BASE_URL?.replace(/\/+$/, "");
  const exportKey = process.env.SCOUT_EXPORT_API_KEY;
  const locationScope = process.env.SCOUT_LOCATION_SCOPE ?? "south_africa";

  if (!baseUrl || !exportKey) {
    throw new Error("Set SCOUT_API_BASE_URL and SCOUT_EXPORT_API_KEY.");
  }

  const parsedUrl = new URL(baseUrl);
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("SCOUT_API_BASE_URL must use HTTP or HTTPS.");
  }

  if (!["cape_town", "western_cape", "south_africa", "all"].includes(locationScope)) {
    throw new Error("SCOUT_LOCATION_SCOPE is not supported by Scout.");
  }

  return { baseUrl, exportKey, locationScope };
}

async function fetchScoutExportPage(
  baseUrl: string,
  exportKey: string,
  locationScope: string,
  offset: number,
) {
  const url = new URL(`${baseUrl}/vacancies/export`);
  url.searchParams.set("limit", String(EXPORT_PAGE_SIZE));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("location_scope", locationScope);

  const response = await fetch(url, {
    method: "GET",
    headers: { "X-Scout-Export-Key": exportKey, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Scout export returned HTTP ${response.status}.`);
  }

  const parsed = scoutExportPageSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error("Scout export response did not match its published API schema.");
  }

  if (parsed.data.offset !== offset || parsed.data.limit !== EXPORT_PAGE_SIZE) {
    throw new Error("Scout export pagination metadata did not match the requested page.");
  }

  return parsed.data;
}

function mapScoutVacancy(vacancy: ScoutExportVacancy) {
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
  };
}

async function runScoutVacancySync() {
  const { baseUrl, exportKey, locationScope } = readScoutConfiguration();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Thungatha server-side Supabase credentials are not configured.");
  }

  const database = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  let offset = 0;
  let received = 0;
  let stored = 0;
  let expectedTotal: number | null = null;

  while (true) {
    const page = await fetchScoutExportPage(
      baseUrl,
      exportKey,
      locationScope,
      offset,
    );

    if (expectedTotal === null) expectedTotal = page.total;
    if (page.total !== expectedTotal) {
      throw new Error("Scout export total changed during pagination; retry the sync.");
    }

    if (page.items.length > 0) {
      const rows = page.items.map(mapScoutVacancy);
      const { error } = await database
        .from("jobs")
        .upsert(rows, { onConflict: "scout_vacancy_id" });
      if (error) throw error;
      received += page.items.length;
      stored += rows.length;
    }

    if (!page.has_more) break;
    if (page.items.length === 0) {
      throw new Error("Scout indicated more vacancies but returned an empty page.");
    }

    offset += page.items.length;
    if (offset > page.total) {
      throw new Error("Scout export pagination exceeded its reported total.");
    }
  }

  lastSuccessfulSyncAt = Date.now();
  return { received, stored };
}

/** Pull Scout's complete active export into Thungatha, safely throttled per server process. */
export async function syncScoutVacanciesIfDue() {
  if (activeSync) return activeSync;
  if (Date.now() - lastSuccessfulSyncAt < SYNC_COOLDOWN_MS) {
    return { received: 0, stored: 0, skipped: true as const };
  }

  activeSync = runScoutVacancySync();
  try {
    return await activeSync;
  } finally {
    activeSync = null;
  }
}

/** Force a fresh pull, used by the protected local/manual sync endpoint. */
export async function syncScoutVacanciesNow() {
  if (activeSync) return activeSync;
  activeSync = runScoutVacancySync();
  try {
    return await activeSync;
  } finally {
    activeSync = null;
  }
}
