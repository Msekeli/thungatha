import "server-only";

import {
  fetchScoutExportPage,
  readScoutConfiguration,
} from "./scout-export-transport";
import { postVacanciesForImport } from "./scout-import-client";

const SYNC_COOLDOWN_MS = 60_000;

let lastSuccessfulSyncAt = 0;
let activeSync: Promise<{ received: number; stored: number }> | null = null;

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
    if (page.total !== expectedTotal) {
      throw new Error(
        "Scout export total changed during pagination; retry the sync.",
      );
    }
    received += page.items.length;
    stored += await postVacanciesForImport(appBaseUrl, syncSecret, page);
    if (!page.has_more) break;
    if (page.items.length === 0) {
      throw new Error(
        "Scout indicated more vacancies but returned an empty page.",
      );
    }
    offset += page.items.length;
    if (offset > page.total) {
      throw new Error("Scout export pagination exceeded its reported total.");
    }
  }

  lastSuccessfulSyncAt = Date.now();
  return { received, stored };
}

/** Pull Scout pages with GET, then POST each validated page to Thungatha's import API. */
export async function syncScoutVacanciesIfDue(appBaseUrl: string) {
  if (activeSync) return activeSync;
  if (Date.now() - lastSuccessfulSyncAt < SYNC_COOLDOWN_MS) {
    return { received: 0, stored: 0, skipped: true as const };
  }
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
