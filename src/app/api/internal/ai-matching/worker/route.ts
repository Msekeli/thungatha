import "server-only";

import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { processJobAiQueue } from "@/thungatha-features/job-discovery/server/job-ai-worker";

export const maxDuration = 300;

function isAuthorised(request: Request) {
  const expectedSecret = process.env.AI_WORKER_SECRET;
  if (!expectedSecret) return false;
  const authorization = request.headers.get("authorization") ?? "";
  const suppliedSecret = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";
  const expected = Buffer.from(expectedSecret);
  const supplied = Buffer.from(suppliedSecret);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function POST(request: Request) {
  if (!isAuthorised(request)) {
    return NextResponse.json({ error: "A valid AI worker secret is required." }, { status: 401 });
  }
  try {
    const result = await processJobAiQueue(1);
    const success = result.failed === 0;
    return NextResponse.json(
      { success, ...result },
      { status: success ? 200 : 503 },
    );
  } catch (error) {
    const errorRecord = error && typeof error === "object"
      ? error as { message?: unknown; code?: unknown; details?: unknown; hint?: unknown }
      : null;
    console.error("[AI job matching] Worker invocation failed:", {
      errorName: error instanceof Error ? error.name : "unknown",
      message: error instanceof Error
        ? error.message
        : typeof errorRecord?.message === "string"
          ? [errorRecord.message, errorRecord.code, errorRecord.details, errorRecord.hint]
              .filter((value): value is string => typeof value === "string" && value.length > 0)
              .join(" | ")
          : "Unknown error",
    });
    return NextResponse.json({ error: "AI worker execution failed." }, { status: 500 });
  }
}
