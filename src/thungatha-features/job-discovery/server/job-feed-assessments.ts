import type { SupabaseClient } from "@supabase/supabase-js";
import { JOB_AI_ASSESSMENT_VERSION } from "./job-ai-queue-eligibility";
import type { AssessmentRecord } from "./job-feed-status";

const BATCH_SIZE = 500;

export async function fetchFeedAssessmentsAndQueue(
  db: SupabaseClient,
  userId: string,
  profileVersion: number,
  jobIds: string[],
): Promise<{
  assessmentsByJob: Map<string, AssessmentRecord>;
  queueStatusByJob: Map<string, "pending" | "processing" | "failed" | "completed">;
  hasError: boolean;
}> {
  const assessmentsByJob = new Map<string, AssessmentRecord>();
  const queueStatusByJob = new Map<string, "pending" | "processing" | "failed" | "completed">();
  if (!jobIds.length) return { assessmentsByJob, queueStatusByJob, hasError: false };

  let hasError = false;
  for (let offset = 0; offset < jobIds.length; offset += BATCH_SIZE) {
    const batch = jobIds.slice(offset, offset + BATCH_SIZE);
    try {
      const [assessmentResult, queueResult] = await Promise.all([
        db.from("job_match_assessments")
          .select("job_id,job_description_hash,classification")
          .eq("user_id", userId).eq("profile_version", profileVersion)
          .eq("assessment_version", JOB_AI_ASSESSMENT_VERSION).in("job_id", batch),
        db.from("ai_task_queue")
          .select("job_id,status")
          .eq("user_id", userId).eq("profile_version", profileVersion)
          .eq("assessment_version", JOB_AI_ASSESSMENT_VERSION).in("job_id", batch),
      ]);

      if (assessmentResult.error) {
        console.error("[job-feed-assessments] Failed to read assessments:", assessmentResult.error);
        hasError = true;
      } else {
        for (const item of assessmentResult.data ?? []) {
          assessmentsByJob.set(item.job_id, {
            hash: item.job_description_hash,
            classification: item.classification,
          });
        }
      }

      if (queueResult.error) {
        console.error("[job-feed-assessments] Failed to read queue tasks:", queueResult.error);
      } else {
        for (const item of queueResult.data ?? []) {
          queueStatusByJob.set(item.job_id, item.status);
        }
      }
    } catch (error) {
      console.error("[job-feed-assessments] Unexpected error fetching assessments:", error);
      hasError = true;
    }
  }

  return { assessmentsByJob, queueStatusByJob, hasError };
}
