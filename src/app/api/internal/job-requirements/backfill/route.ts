import "server-only";

import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { backfillJobRequirements } from "@/thungatha-features/job-discovery/server/job-requirement-backfill";

const DEFAULT_BATCHES = 5;
const MAX_BATCHES = 10;

function isAuthorised(request: Request) {
  const expectedSecret = process.env.JOB_REQUIREMENTS_BACKFILL_SECRET ?? process.env.SCOUT_SYNC_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!expectedSecret) return false;
  const expectedBytes = Buffer.from(expectedSecret);
  const suppliedBytes = Buffer.from(supplied);
  return suppliedBytes.length === expectedBytes.length &&
    timingSafeEqual(suppliedBytes, expectedBytes);
}

function readBatchCount(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value)) return DEFAULT_BATCHES;
  return Math.min(Math.max(value, 1), MAX_BATCHES);
}

export async function POST(request: Request) {
  if (!isAuthorised(request)) {
    return NextResponse.json({ error: "A valid backfill secret is required." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const afterId = body && typeof body === "object" && !Array.isArray(body) &&
      typeof body.afterId === "string" ? body.afterId : null;
    const batchCount = readBatchCount(
      body && typeof body === "object" && !Array.isArray(body) ? body.batches : undefined,
    );

    let cursor = afterId;
    let scanned = 0;
    let extracted = 0;
    let unchanged = 0;
    let batchesProcessed = 0;

    for (let index = 0; index < batchCount; index += 1) {
      const result = await backfillJobRequirements(cursor);
      scanned += result.scanned;
      extracted += result.extracted;
      unchanged += result.unchanged;
      batchesProcessed += 1;
      cursor = result.nextCursor;
      if (!cursor || result.scanned === 0) break;
    }

    return NextResponse.json({
      success: true,
      scanned,
      extracted,
      unchanged,
      batchesProcessed,
      nextCursor: cursor,
      hasMore: cursor !== null,
    });
  } catch (error) {
    console.error("[Job requirements backfill] Failed:", {
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json({ error: "Job requirements backfill failed." }, { status: 500 });
  }
}
