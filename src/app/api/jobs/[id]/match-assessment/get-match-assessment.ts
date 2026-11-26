import { NextResponse } from "next/server";
import { apiError, apiFailure } from "@/lib/http/api-response";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import {
  enqueueVisibleJobAssessments,
  getJobAiTaskStatus,
  isUsableJobDescription,
  JOB_AI_ASSESSMENT_VERSION,
  JOB_AI_UNDERSTANDING_VERSION,
  requeueCompletedJobAiTask,
} from "@/thungatha-features/job-discovery/server/job-ai-queue";
import {
  createJobMatchingContext,
  hashJobContext,
} from "@/thungatha-features/job-discovery/server/job-ai-queue-eligibility";
import { resolveEvidenceLinkedAssessment } from "./evidence-resolver";
import type { AuthIdentity } from "./auth-helper";

export async function getMatchAssessment(
  id: string,
  identity: AuthIdentity,
) {
  try {
    const db = await createAuthenticatedSupabaseClient(identity.getToken);
    const [profileResult, jobResult] = await Promise.all([
      db
        .from("profiles")
        .select("profile_version,confirmed_at")
        .eq("user_id", identity.userId)
        .maybeSingle(),
      db
        .from("jobs")
        .select("title,employer_name,location_text,description")
        .eq("id", id)
        .maybeSingle(),
    ]);
    if (profileResult.error) throw profileResult.error;
    if (jobResult.error) throw jobResult.error;
    if (!jobResult.data) return apiError("Job not found", 404);
    if (!profileResult.data?.confirmed_at) {
      return NextResponse.json({
        status: "profile_unconfirmed",
        assessment: null,
      });
    }

    const context = createJobMatchingContext(jobResult.data);
    if (!isUsableJobDescription(context.description)) {
      return NextResponse.json({
        status: "unusable_description",
        assessment: null,
      });
    }
    const contextHash = hashJobContext(context);
    const { data, error } = await db
      .from("job_match_assessments")
      .select("classification,assessment,created_at")
      .eq("user_id", identity.userId)
      .eq("job_id", id)
      .eq("profile_version", profileResult.data.profile_version)
      .eq("job_context_hash", contextHash)
      .eq("assessment_version", JOB_AI_ASSESSMENT_VERSION)
      .maybeSingle();
    if (error) throw error;

    if (
      data &&
      (data.classification === "match" || data.classification === "relevant")
    ) {
      const { data: understandingData } = await db
        .from("job_ai_understandings")
        .select("understanding")
        .eq("context_hash", contextHash)
        .eq("analysis_version", JOB_AI_UNDERSTANDING_VERSION)
        .maybeSingle();
      const assessment = await resolveEvidenceLinkedAssessment({
        userId: identity.userId,
        token: identity.getToken,
        context,
        assessment: data.assessment as Parameters<
          typeof resolveEvidenceLinkedAssessment
        >[0]["assessment"],
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
    return NextResponse.json({
      status: taskStatus === "failed" ? "failed" : "pending",
      assessment: null,
    });
  } catch (error) {
    return apiFailure(error);
  }
}
