import "server-only";

import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { syncScoutVacanciesNow } from "@/thungatha-features/job-discovery/server/scout-export-client";

function isAuthorised(request: Request) {
  const expectedSecret = process.env.SCOUT_SYNC_SECRET;
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
      { error: "A valid Thungatha sync secret is required." },
      { status: 401 },
    );
  }

  try {
    const result = await syncScoutVacanciesNow(new URL(request.url).origin);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[Scout vacancy sync] Manual sync failed:", {
      errorName: error instanceof Error ? error.name : "unknown",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scout sync failed." },
      { status: 502 },
    );
  }
}
