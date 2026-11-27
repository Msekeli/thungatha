import { NextResponse } from "next/server";
import { apiError, apiFailure } from "@/lib/http/api-response";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import {
  enqueueVisibleJobAssessments,
  getJobAiTaskStatus,
  isUsableJobDescription,
  JOB_AI_ASSESSMENT_VERSION,
  retryFailedJobAiTask,
  requeueCompletedJobAiTask,
} from "@/thungatha-features/job-discovery/server/job-ai-queue";
import {
  createJobMatchingContext,
  hashJobContext,
} from "@/thungatha-features/job-discovery/server/job-ai-queue-eligibility";
import type { AuthIdentity } from "./auth-helper";

export async function postMatchAssessment(id: string, identity: AuthIdentity) {
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
      return NextResponse.json(
        { status: "profile_unconfirmed" },
        { status: 409 },
      );
    }

    const context = createJobMatchingContext(jobResult.data);
    if (!isUsableJobDescription(context.description)) {
      return NextResponse.json(
        { status: "unusable_description" },
        { status: 422 },
      );
    }
    const profileVersion = profileResult.data.profile_version ?? 1;
    const contextHash = hashJobContext(context);
    const assessmentQuery = await db
      .from("job_match_assessments")
      .select("classification,created_at")
      .eq("user_id", identity.userId)
      .eq("job_id", id)
      .eq("profile_version", profileVersion)
      .eq("job_context_hash", contextHash)
      .eq("assessment_version", JOB_AI_ASSESSMENT_VERSION)
      .maybeSingle();
    if (assessmentQuery.error) throw assessmentQuery.error;
    if (assessmentQuery.data) {
      return NextResponse.json({
        status: "ready",
        assessment: assessmentQuery.data,
      });
    }

    const taskInput = {
      userId: identity.userId,
      jobId: id,
      profileVersion,
      contextHash,
    };
    let taskStatus = await getJobAiTaskStatus(taskInput);
    if (!taskStatus) {
      await enqueueVisibleJobAssessments(identity.userId, [id]);
      taskStatus = await getJobAiTaskStatus(taskInput);
    } else if (taskStatus === "failed") {
      const retried = await retryFailedJobAiTask(taskInput);
      taskStatus = retried ? "pending" : await getJobAiTaskStatus(taskInput);
    } else if (taskStatus === "completed") {
      const requeued = await requeueCompletedJobAiTask(taskInput);
      taskStatus = requeued ? "pending" : await getJobAiTaskStatus(taskInput);
    }

    if (taskStatus === "unavailable") {
      return NextResponse.json({ status: "unavailable", assessment: null });
    }
    if (taskStatus === "pending" || taskStatus === "processing") {
      return NextResponse.json(
        { status: taskStatus, assessment: null },
        { status: 202 },
      );
    }
    if (taskStatus === "completed") {
      return NextResponse.json(
        { status: "completed_without_assessment", assessment: null },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { status: "not_queued", assessment: null },
      { status: 409 },
    );
  } catch (error) {
    return apiFailure(error);
  }
}
