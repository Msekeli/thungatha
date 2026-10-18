import "server-only";

import type { JobProvider } from "../provider";
import { AdzunaProvider, JoobleProvider } from "./aggregators";
import { GreenhouseProvider } from "./ats";

export function getJobProviders(): JobProvider[] {
  const providers: JobProvider[] = [];

  const adzunaAppId = process.env.ADZUNA_APP_ID;
  const adzunaAppKey = process.env.ADZUNA_APP_KEY;

  if (adzunaAppId?.trim() && adzunaAppKey?.trim()) {
    providers.push(new AdzunaProvider(adzunaAppId, adzunaAppKey));
  }

  const joobleApiKey = process.env.JOOBLE_API_KEY;

  if (joobleApiKey?.trim()) {
    providers.push(new JoobleProvider(joobleApiKey));
  }

  const greenhouseBoardToken = process.env.GREENHOUSE_BOARD_TOKEN;

  if (greenhouseBoardToken?.trim()) {
    providers.push(new GreenhouseProvider(greenhouseBoardToken));
  }

  return providers;
}
