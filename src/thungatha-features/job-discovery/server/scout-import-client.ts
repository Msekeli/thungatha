import "server-only";

const REQUEST_TIMEOUT_MS = 45_000;

export async function postVacanciesForImport(
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
