import "server-only";

import { scoutExportPageSchema } from "./scout-export-schema";

export const EXPORT_PAGE_SIZE = 100;
const REQUEST_TIMEOUT_MS = 45_000;

export function readScoutConfiguration() {
  const baseUrl = process.env.SCOUT_API_BASE_URL?.replace(/\/+$/, "");
  const exportKey = process.env.SCOUT_EXPORT_API_KEY?.trim() || null;
  const syncSecret = process.env.SCOUT_SYNC_SECRET;
  const locationScope = process.env.SCOUT_LOCATION_SCOPE ?? "south_africa";

  if (!baseUrl) throw new Error("Set SCOUT_API_BASE_URL.");
  if (!syncSecret) {
    throw new Error(
      "Set SCOUT_SYNC_SECRET to protect the internal import endpoint.",
    );
  }
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

export async function fetchScoutExportPage(
  baseUrl: string,
  exportKey: string | null,
  locationScope: string,
  offset: number,
) {
  const url = new URL(baseUrl + "/vacancies/export");
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
  if (!response.ok) {
    throw new Error(`Scout export returned HTTP ${response.status}.`);
  }
  const parsed = scoutExportPageSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error(
      "Scout export response did not match its published API schema.",
    );
  }
  if (parsed.data.offset !== offset || parsed.data.limit !== EXPORT_PAGE_SIZE) {
    throw new Error(
      "Scout export pagination metadata did not match the requested page.",
    );
  }
  return parsed.data;
}
