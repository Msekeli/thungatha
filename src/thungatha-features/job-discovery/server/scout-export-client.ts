import "server-only";

import { scoutExportPageSchema } from "./scout-export-schema";

const EXPORT_PAGE_SIZE = 100;
const REQUEST_TIMEOUT_MS = 45_000;
const SYNC_COOLDOWN_MS = 60_000;

let lastSuccessfulSyncAt = 0;
let activeSync: Promise<{ received: number; stored: number }> | null = null;

function readScoutConfiguration() {
  const baseUrl = process.env.SCOUT_API_BASE_URL?.replace(/\/+$/, "");
  const exportKey = process.env.SCOUT_EXPORT_API_KEY?.trim() || null;
  const syncSecret = process.env.SCOUT_SYNC_SECRET;
  const locationScope = process.env.SCOUT_LOCATION_SCOPE ?? "south_africa";

  if (!baseUrl) throw new Error("Set SCOUT_API_BASE_URL.");
  if (!syncSecret)
    throw new Error(
      "Set SCOUT_SYNC_SECRET to protect the internal import endpoint.",
    );

  const parsedUrl = new URL(baseUrl);
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("SCOUT_API_BASE_URL must use HTTP or HTTPS.");
  }
  if (
    !["cape_town", "western_cape", "south_africa", "all"].includes(
      locationScope,
    )
  ) {
    throw new Error("SCOUT_LOCATION_SCOPE is not supported by Scout.");
  }
  return { baseUrl, exportKey, syncSecret, locationScope };
}

async function fetchScoutExportPage(
  baseUrl: string,
  exportKey: string | null,
  locationScope: string,
  offset: number,
) {
  const url = new URL(`${baseUrl}/vacancies/export`);
  url.searchParams.set("limit", String(EXPORT_PAGE_SIZE));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("location_scope", locationScope);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(exportKey ? { "X-Scout-Export-Key": exportKey } : {}),
      Accept: "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok)
    throw new Error(`Scout export returned HTTP ${response.status}.`);

  const parsed = scoutExportPageSchema.safeParse(await response.json());
  if (!parsed.success)
    throw new Error(
      "Scout export response did not match its published API schema.",
    );
  if (parsed.data.offset !== offset || parsed.data.limit !== EXPORT_PAGE_SIZE) {
    throw new Error(
      "Scout export pagination metadata did not match the requested page.",
    );
  }
  return parsed.data;
}

async function postVacanciesForImport(
  appBaseUrl: string,
  syncSecret: string,
  page: unknown,
) {
  const response = await fetch(
    new URL("/api/internal/scout/vacancies/import", appBaseUrl),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${syncSecret}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(page),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    },
  );
  const result = (await response.json().catch(() => null)) as {
    stored?: number;
    error?: string;
    diagnostic?: {
      code?: string | null;
      message?: string | null;
      details?: string | null;
      hint?: string | null;
    };
  } | null;
  if (!response.ok) {
    const diagnostic = result?.diagnostic;
    const detail = diagnostic
      ? [
          diagnostic.code,
          diagnostic.message,
          diagnostic.details,
          diagnostic.hint,
        ]
          .filter(Boolean)
          .join(" | ")
      : null;
    throw new Error(
      [
        result?.error ??
          `Thungatha import endpoint returned HTTP ${response.status}.`,
        detail,
      ]
        .filter(Boolean)
        .join(" "),
    );
  }
  return result?.stored ?? 0;
}

async function runScoutVacancySync(appBaseUrl: string) {
  const { baseUrl, exportKey, syncSecret, locationScope } =
    readScoutConfiguration();
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
    if (page.total !== expectedTotal)
      throw new Error(
        "Scout export total changed during pagination; retry the sync.",
      );

    received += page.items.length;
    stored += await postVacanciesForImport(appBaseUrl, syncSecret, page);

    if (!page.has_more) break;
    if (page.items.length === 0)
      throw new Error(
        "Scout indicated more vacancies but returned an empty page.",
      );
    offset += page.items.length;
    if (offset > page.total)
      throw new Error("Scout export pagination exceeded its reported total.");
  }

  lastSuccessfulSyncAt = Date.now();
  return { received, stored };
}

/** Pull Scout pages with GET, then POST each validated page to Thungatha's own import API. */
export async function syncScoutVacanciesIfDue(appBaseUrl: string) {
  if (activeSync) return activeSync;
  if (Date.now() - lastSuccessfulSyncAt < SYNC_COOLDOWN_MS)
    return { received: 0, stored: 0, skipped: true as const };
  activeSync = runScoutVacancySync(appBaseUrl);
  try {
    return await activeSync;
  } finally {
    activeSync = null;
  }
}

export async function syncScoutVacanciesNow(appBaseUrl: string) {
  if (activeSync) return activeSync;
  activeSync = runScoutVacancySync(appBaseUrl);
  try {
    return await activeSync;
  } finally {
    activeSync = null;
  }
}
