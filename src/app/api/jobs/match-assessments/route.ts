import { connection, NextResponse } from "next/server";
import { apiFailure } from "@/lib/http/api-response";
import { enqueueAllJobAssessments } from "@/thungatha-features/job-discovery/server/job-ai-queue";
import { requireAuthIdentity } from "../[id]/match-assessment/auth-helper";

export const maxDuration = 120;

/**
 * Queue assessments for the complete job catalogue for the authenticated,
 * confirmed Profile. Database deduplication makes repeated calls safe.
 */
export async function POST() {
  await connection();
  const { errorResponse, identity } = await requireAuthIdentity();
  if (errorResponse || !identity) return errorResponse;

  try {
    const result = await enqueueAllJobAssessments(identity.userId);
    if (result.eligible === 0) {
      return NextResponse.json(
        {
          status: "profile_unconfirmed_or_no_eligible_jobs",
          ...result,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        status: "queued",
        message: "Eligible job assessments have been added to the AI queue.",
        ...result,
      },
      { status: 202 },
    );
  } catch (error) {
    return apiFailure(error);
  }
}
