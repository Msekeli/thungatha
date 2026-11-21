import { createHash } from "node:crypto";
import { after, connection, NextResponse } from "next/server";
import { z } from "zod";
import { apiError, apiFailure } from "@/lib/http/api-response";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/thungatha-features/authentication/server/identity";
import { processJobAiQueue } from "@/thungatha-features/job-discovery/server/job-ai-worker";
import { readCandidateFacts } from "@/thungatha-features/user-profile/server/read-candidate-facts";
import { buildJobEvidence } from "@/thungatha-features/job-discovery/server/job-ai-evidence";
import {
  getJobAiTaskStatus,
  JOB_AI_ASSESSMENT_VERSION,
  retryFailedJobAiTask,
} from "@/thungatha-features/job-discovery/server/job-ai-queue";

export const maxDuration = 120;

const idSchema = z.string().uuid();

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await connection();
  if (!hasClerkConfiguration()) return apiError("Authentication required", 401);

  let identity: Awaited<ReturnType<typeof getAuthenticatedIdentity>> = null;
  try {
    identity = await getAuthenticatedIdentity();
  } catch {
    return apiError("Authentication could not be verified", 503);
  }
  if (!identity) return apiError("Authentication required", 401);

  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return apiError("Invalid job ID", 400);

  try {
    const db = await createAuthenticatedSupabaseClient(identity.getToken);
    const [profileResult, jobResult] = await Promise.all([
      db.from("profiles").select("profile_version,confirmed_at")
        .eq("user_id", identity.userId).maybeSingle(),
      db.from("jobs").select("description").eq("id", id)
        .not("scout_vacancy_id", "is", null).maybeSingle(),
    ]);
    if (profileResult.error) throw profileResult.error;
    if (jobResult.error) throw jobResult.error;
    if (!jobResult.data) return apiError("Job not found", 404);
    if (!profileResult.data?.confirmed_at) {
      return NextResponse.json({ status: "profile_unconfirmed", assessment: null });
    }

    const descriptionHash = createHash("sha256")
      .update(jobResult.data.description ?? "")
      .digest("hex");
    const { data, error } = await db.from("job_match_assessments")
      .select("classification,assessment,created_at")
      .eq("user_id", identity.userId)
      .eq("job_id", id)
      .eq("profile_version", profileResult.data.profile_version)
      .eq("job_description_hash", descriptionHash)
      .eq("assessment_version", JOB_AI_ASSESSMENT_VERSION)
      .maybeSingle();
    if (error) throw error;

    if (data) {
      const facts = await readCandidateFacts(identity.userId, identity.getToken);
      const jobEvidence = buildJobEvidence(jobResult.data.description ?? "");
      const evidenceById = new Map([
        ...jobEvidence.map((item) => [item.id, item] as const),
        ...(facts?.evidence ?? []).map((item) => [item.id, item] as const),
      ]);
      const resolve = (references: string[]) => references
        .map((reference) => evidenceById.get(reference))
        .filter((item): item is NonNullable<typeof item> => Boolean(item));
      const { data: understandingData, error: understandingError } = await db
        .from("job_ai_understandings").select("understanding")
        .eq("job_id", id).eq("description_hash", descriptionHash)
        .eq("analysis_version", JOB_AI_ASSESSMENT_VERSION).maybeSingle();
      if (understandingError) throw understandingError;
      const assessment = data.assessment as {
        semanticAlignment?: { jobEvidenceRefs: string[]; profileEvidenceRefs: string[] };
        requirements?: Array<{ jobEvidenceRefs: string[]; profileEvidenceRefs: string[] }>;
        gaps?: Array<{ jobEvidenceRefs: string[]; profileEvidenceRefs: string[] }>;
      };
      const evidenceLinkedAssessment = {
        ...assessment,
        understandingCoverage: (understandingData?.understanding as { coverage?: "complete" | "partial" | "unavailable" } | null)?.coverage ?? "unavailable",
        semanticAlignment: assessment.semanticAlignment ? {
          ...assessment.semanticAlignment,
          jobEvidence: resolve(assessment.semanticAlignment.jobEvidenceRefs),
          profileEvidence: resolve(assessment.semanticAlignment.profileEvidenceRefs),
        } : undefined,
        requirements: assessment.requirements?.map((item) => ({
          ...item, jobEvidence: resolve(item.jobEvidenceRefs), profileEvidence: resolve(item.profileEvidenceRefs),
        })),
        gaps: assessment.gaps?.map((item) => ({
          ...item, jobEvidence: resolve(item.jobEvidenceRefs), profileEvidence: resolve(item.profileEvidenceRefs),
        })),
      };
      return NextResponse.json({ status: "ready", ...data, assessment: evidenceLinkedAssessment });
    }

    const taskStatus = await getJobAiTaskStatus({
      userId: identity.userId,
      jobId: id,
      profileVersion: profileResult.data.profile_version ?? 1,
      descriptionHash,
    });

    return NextResponse.json({
      status: taskStatus === "failed" ? "failed" : "pending",
      assessment: null,
    });
  } catch (error) {
    return apiFailure(error);
  }
}


export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await connection();
  if (!hasClerkConfiguration()) return apiError("Authentication required", 401);

  let identity: Awaited<ReturnType<typeof getAuthenticatedIdentity>> = null;
  try {
    identity = await getAuthenticatedIdentity();
  } catch {
    return apiError("Authentication could not be verified", 503);
  }
  if (!identity) return apiError("Authentication required", 401);

  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return apiError("Invalid job ID", 400);

  try {
    const db = await createAuthenticatedSupabaseClient(identity.getToken);
    const [profileResult, jobResult] = await Promise.all([
      db.from("profiles").select("profile_version,confirmed_at")
        .eq("user_id", identity.userId).maybeSingle(),
      db.from("jobs").select("description").eq("id", id)
        .not("scout_vacancy_id", "is", null).maybeSingle(),
    ]);
    if (profileResult.error) throw profileResult.error;
    if (jobResult.error) throw jobResult.error;
    if (!jobResult.data) return apiError("Job not found", 404);
    if (!profileResult.data?.confirmed_at) {
      return NextResponse.json({ status: "profile_unconfirmed" }, { status: 409 });
    }

    const descriptionHash = createHash("sha256")
      .update(jobResult.data.description ?? "")
      .digest("hex");
    const retried = await retryFailedJobAiTask({
      userId: identity.userId,
      jobId: id,
      profileVersion: profileResult.data.profile_version ?? 1,
      descriptionHash,
    });

    if (!retried) {
      return NextResponse.json(
        { error: "This assessment is not in a retryable failed state." },
        { status: 409 },
      );
    }

    after(async () => {
      try {
        await processJobAiQueue(1);
      } catch (workerError) {
        console.error("[AI job matching] Retry worker failed:", {
          message: workerError instanceof Error ? workerError.message : "Unknown worker error",
        });
      }
    });

    return NextResponse.json({ status: "pending" }, { status: 202 });
  } catch (error) {
    return apiFailure(error);
  }
}
