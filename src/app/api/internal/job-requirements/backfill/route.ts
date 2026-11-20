import "server-only";

import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { backfillJobRequirements } from "@/thungatha-features/job-discovery/server/job-requirement-backfill";

function isAuthorised(request: Request) {
  const expectedSecret = process.env.JOB_REQUIREMENTS_BACKFILL_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!expectedSecret) return false;
  const expectedBytes = Buffer.from(expectedSecret);
  const suppliedBytes = Buffer.from(supplied);
  return suppliedBytes.length === expectedBytes.length &&
    timingSafeEqual(suppliedBytes, expectedBytes);
}

export async function POST(request: Request) {
  if (!isAuthorised(request)) {
    return NextResponse.json({ error: "A valid backfill secret is required." }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const afterId = typeof body.afterId === "string" ? body.afterId : null;
    const result = await backfillJobRequirements(afterId);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[Job requirements backfill] Failed:", {
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json({ error: "Job requirements backfill failed." }, { status: 500 });
  }
}
