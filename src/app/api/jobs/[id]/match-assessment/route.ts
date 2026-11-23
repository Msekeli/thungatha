import { connection, NextResponse } from "next/server";
import { z } from "zod";
import { apiError, apiFailure } from "@/lib/http/api-response";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import {
  enqueueVisibleJobAssessments,
  getJobAiTaskStatus,
  isUsableJobDescription,
  JOB_AI_ASSESSMENT_VERSION,
  JOB_AI_UNDERSTANDING_VERSION,
  retryFailedJobAiTask,
  requeueCompletedJobAiTask,
} from "@/thungatha-features/job-discovery/server/job-ai-queue";
import { resolveEvidenceLinkedAssessment } from "./evidence-resolver";
import { requireAuthIdentity } from "./auth-helper";
import { createJobMatchingContext, hashJobContext } from "@/thungatha-features/job-discovery/server/job-ai-queue-eligibility";

export const maxDuration = 120;
const idSchema = z.string().uuid();

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  await connection();
  const { errorResponse, identity } = await requireAuthIdentity();
  if (errorResponse || !identity) return errorResponse;

  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return apiError("Invalid job ID", 400);

  try {
    const db = await createAuthenticatedSupabaseClient(identity.getToken);
    const [profileResult, jobResult] = await Promise.all([
      db.from("profiles").select("profile_version,confirmed_at").eq("user_id", identity.userId).maybeSingle(),
      db.from("jobs").select("title,employer_name,location_text,description").eq("id", id).maybeSingle(),
    ]);
    if (profileResult.error) throw profileResult.error;
    if (jobResult.error) throw jobResult.error;
    if (!jobResult.data) return apiError("Job not found", 404);
    if (!profileResult.data?.confirmed_at) return NextResponse.json({ status: "profile_unconfirmed", assessment: null });

    const context = createJobMatchingContext(jobResult.data);
    const description = context.description;
    if (!isUsableJobDescription(description)) return NextResponse.json({ status: "unusable_description", assessment: null });

    const contextHash = hashJobContext(context);
    const { data, error } = await db.from("job_match_assessments")
      .select("classification,assessment,created_at").eq("user_id", identity.userId).eq("job_id", id)
      .eq("profile_version", profileResult.data.profile_version)
      .eq("job_context_hash", contextHash).eq("assessment_version", JOB_AI_ASSESSMENT_VERSION).maybeSingle();
    if (error) throw error;

    if (data && (data.classification === "match" || data.classification === "relevant")) {
      const { data: understandingData } = await db.from("job_ai_understandings").select("understanding")
        .eq("context_hash", contextHash)
        .eq("analysis_version", JOB_AI_UNDERSTANDING_VERSION).maybeSingle();
      const assessment = await resolveEvidenceLinkedAssessment({
        userId: identity.userId, token: identity.getToken, context,
        assessment: data.assessment as Parameters<typeof resolveEvidenceLinkedAssessment>[0]["assessment"],
        understandingData,
      });
      return NextResponse.json({ status: "ready", ...data, assessment });
    }

    const taskInput = {
      userId: identity.userId,
      jobId: id,
      profileVersion: profileResult.data.profile_version ?? 1,
      contextHash,
    };
    let taskStatus = await getJobAiTaskStatus(taskInput);
    if (taskStatus === "completed") {
      const requeued = await requeueCompletedJobAiTask(taskInput);
      taskStatus = requeued ? "pending" : await getJobAiTaskStatus(taskInput);
    }
    if (!taskStatus) {
      await enqueueVisibleJobAssessments(identity.userId, [id]);
      taskStatus = "pending";
    }
    if (taskStatus === "completed") taskStatus = "failed";
    if (taskStatus === "unavailable") {
      return NextResponse.json({ status: "unavailable", assessment: null });
    }
    return NextResponse.json({ status: taskStatus === "failed" ? "failed" : "pending", assessment: null });
  } catch (error) { return apiFailure(error); }
}

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  await connection();
  const { errorResponse, identity } = await requireAuthIdentity();
  if (errorResponse || !identity) return errorResponse;

  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return apiError("Invalid job ID", 400);

  try {
    const db = await createAuthenticatedSupabaseClient(identity.getToken);
    const [profileResult, jobResult] = await Promise.all([
      db.from("profiles").select("profile_version,confirmed_at").eq("user_id", identity.userId).maybeSingle(),
      db.from("jobs").select("title,employer_name,location_text,description").eq("id", id).maybeSingle(),
    ]);
    if (profileResult.error) throw profileResult.error;
    if (jobResult.error) throw jobResult.error;
    if (!jobResult.data) return apiError("Job not found", 404);
    if (!profileResult.data?.confirmed_at) return NextResponse.json({ status: "profile_unconfirmed" }, { status: 409 });

    const context = createJobMatchingContext(jobResult.data);
    const contextHash = hashJobContext(context);
    const retried = await retryFailedJobAiTask({
      userId: identity.userId, jobId: id, profileVersion: profileResult.data.profile_version ?? 1, contextHash,
    });
    if (!retried) return NextResponse.json({ error: "This assessment is not in a retryable failed state." }, { status: 409 });
    return NextResponse.json({ status: "pending" }, { status: 202 });
  } catch (error) { return apiFailure(error); }
}
