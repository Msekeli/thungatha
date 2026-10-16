import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ingestJobs } from "@/lib/jobs/ingestion";

/**
 * Server-to-server ingestion endpoint for a scheduler or an authorised operator.
 * Never expose the Supabase service key to this route's caller.
 */
export async function POST(request: Request) {
  const expectedSecret =
    process.env.INGESTION_CRON_SECRET ?? process.env.CRON_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "Job ingestion is not configured" },
      { status: 503 },
    );
  }

  const authorization = request.headers.get("authorization") ?? "";
  const suppliedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const expected = Buffer.from(expectedSecret);
  const supplied = Buffer.from(suppliedSecret);

  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await ingestJobs();
    return NextResponse.json(result, {
      status: result.totals.errors > 0 ? 207 : 200,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown ingestion error";
    const notConfigured =
      message.includes("configuration is missing") ||
      message.includes("No job providers are configured");

    console.error("[job ingestion] Could not start ingestion:", {
      errorName: error instanceof Error ? error.name : "unknown",
    });

    return NextResponse.json(
      {
        error: notConfigured
          ? "Job ingestion configuration is incomplete"
          : "Job ingestion could not be started",
      },
      { status: notConfigured ? 503 : 500 },
    );
  }
}
