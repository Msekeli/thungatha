import "server-only";

import { NextResponse } from "next/server";
import { scoutVacancyBatchSchema } from "@/thungatha-features/job-discovery/server/scout-vacancy-schema";
import {
  isAuthorisedScoutRequest,
  isScoutReceiverConfigured,
  persistScoutVacancies,
} from "@/thungatha-features/job-discovery/server/scout-vacancy-receiver";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isScoutReceiverConfigured()) {
    return NextResponse.json(
      { error: "Scout integration is not configured." },
      { status: 503 },
    );
  }
  if (!isAuthorisedScoutRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = scoutVacancyBatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Scout vacancy payload failed contract validation.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  try {
    const accepted = await persistScoutVacancies(parsed.data);
    return NextResponse.json({ accepted });
  } catch (error) {
    console.error("[Scout vacancy receiver] Persistence failed:", {
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json(
      { error: "Scout vacancies could not be stored." },
      { status: 500 },
    );
  }
}
