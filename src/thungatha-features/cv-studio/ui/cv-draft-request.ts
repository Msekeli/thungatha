import type { CvSuggestion } from "../server/cv-studio-schema";

export async function requestCvDraftJson<T>(
  url: string,
  options: RequestInit,
  fallback: string,
  includeRequestId = false,
): Promise<T> {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok) {
    const requestId =
      includeRequestId && typeof body.requestId === "string"
        ? ` (Request ID: ${body.requestId})`
        : "";
    throw new Error(`${body.error ?? fallback}${requestId}`);
  }
  return body as T;
}
