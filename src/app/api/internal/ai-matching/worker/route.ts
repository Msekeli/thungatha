import "server-only";

import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { processJobAiQueue } from "@/thungatha-features/job-discovery/server/job-ai-worker";

export const maxDuration = 300;

function isAuthorised(request: Request) {
  const expectedSecret = process.env.AI_WORKER_SECRET;
  if (!expectedSecret) return false;
  const authorization = request.headers.get("authorization") ?? "";
  const suppliedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const expected = Buffer.from(expectedSecret);
  const supplied = Buffer.from(suppliedSecret);
  return (
    supplied.length === expected.length && timingSafeEqual(supplied, expected)
  );
}

export async function POST(request: Request) {
  if (!isAuthorised(request)) {
    return NextResponse.json(
      { error: "A valid AI worker secret is required." },
      { status: 401 },
    );
  }
  try {
    let jobIds: string[] | undefined;
    const rawBody = await request.text();
    if (rawBody.trim()) {
      let body: unknown;
      try {
        body = JSON.parse(rawBody);
      } catch {
        return NextResponse.json(
          { error: "Request body must be valid JSON." },
          { status: 400 },
        );
      }
      if (
        !body ||
        typeof body !== "object" ||
        !("jobIds" in body) ||
        !Array.isArray((body as { jobIds: unknown }).jobIds) ||
        (body as { jobIds: unknown[] }).jobIds.length === 0 ||
        !(body as { jobIds: unknown[] }).jobIds.every(
          (id) =>
            typeof id === "string" &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
              id,
            ),
        )
      ) {
        return NextResponse.json(
          { error: "Provide a non-empty jobIds array containing valid UUIDs." },
          { status: 400 },
        );
      }
      jobIds = [...new Set((body as { jobIds: string[] }).jobIds)];
    }
    const result = await processJobAiQueue({ jobIds });
    const success = result.failed === 0;
    return NextResponse.json(
      { success, ...result },
      { status: success ? 200 : 503 },
    );
  } catch (error) {
    const errorRecord =
      error && typeof error === "object"
        ? (error as {
            message?: unknown;
            code?: unknown;
            details?: unknown;
            hint?: unknown;
          })
        : null;
    console.error("[AI job matching] Worker invocation failed:", {
      errorName: error instanceof Error ? error.name : "unknown",
      message:
        error instanceof Error
          ? error.message
          : typeof errorRecord?.message === "string"
            ? [
                errorRecord.message,
                errorRecord.code,
                errorRecord.details,
                errorRecord.hint,
              ]
                .filter(
                  (value): value is string =>
                    typeof value === "string" && value.length > 0,
                )
                .join(" | ")
            : "Unknown error",
    });
    return NextResponse.json(
      { error: "AI worker execution failed." },
      { status: 500 },
    );
  }
}

/**
 * Vercel Cron entry point. Configure CRON_SECRET in the deployment environment.
 * The worker remains safe for overlapping invocations because the database
 * claim function owns task locking.
 */
export async function GET(request: Request) {
  const expectedSecret =
    process.env.CRON_SECRET ?? process.env.AI_WORKER_SECRET;
  const authorization = request.headers.get("authorization") ?? "";
  const suppliedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "A cron or AI worker secret is required." },
      { status: 503 },
    );
  }
  const expected = Buffer.from(expectedSecret);
  const supplied = Buffer.from(suppliedSecret);
  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return NextResponse.json(
      { error: "A valid worker secret is required." },
      { status: 401 },
    );
  }
  try {
    const result = await processJobAiQueue();
    const success = result.failed === 0;
    return NextResponse.json(
      { success, ...result },
      { status: success ? 200 : 503 },
    );
  } catch (error) {
    console.error("[AI job matching] Scheduled worker invocation failed:", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Scheduled AI worker execution failed." },
      { status: 500 },
    );
  }
}
