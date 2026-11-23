import "server-only";

import {
  JOB_AI_ASSESSMENT_VERSION,
  JOB_AI_UNDERSTANDING_VERSION,
  createServiceClient,
  hashDescription,
  isUsableJobDescription,
  getConfirmedProfileVersion,
  getJobAiTaskStatus,
  retryFailedJobAiTask,
  requeueCompletedJobAiTask,
} from "./job-ai-queue-eligibility";

export {
  JOB_AI_ASSESSMENT_VERSION,
  JOB_AI_UNDERSTANDING_VERSION,
  isUsableJobDescription,
  getJobAiTaskStatus,
  retryFailedJobAiTask,
  requeueCompletedJobAiTask,
};

const BACKFILL_BATCH_SIZE = 500;

async function enqueueJobRows(
  userId: string,
  profileVersion: number,
  jobs: { id: string; description: string | null }[],
) {
  const eligible = jobs.filter((job) => isUsableJobDescription(job.description));
  if (!eligible.length) return 0;

  const db = createServiceClient();
  const jobIds = eligible.map((job) => job.id);
  const [queueResult, assessmentResult] = await Promise.all([
    db.from("ai_task_queue")
      .select("job_id,job_description_hash")
      .eq("user_id", userId)
      .eq("profile_version", profileVersion)
      .eq("assessment_version", JOB_AI_ASSESSMENT_VERSION)
      .in("job_id", jobIds),
    db.from("job_match_assessments")
      .select("job_id,job_description_hash")
      .eq("user_id", userId)
      .eq("profile_version", profileVersion)
      .eq("assessment_version", JOB_AI_ASSESSMENT_VERSION)
      .in("job_id", jobIds),
  ]);
  if (queueResult.error) throw queueResult.error;
  if (assessmentResult.error) throw assessmentResult.error;

  const handled = new Set([
    ...(queueResult.data ?? []).map((item) => [item.job_id, item.job_description_hash].join(":")),
    ...(assessmentResult.data ?? []).map((item) => [item.job_id, item.job_description_hash].join(":")),
  ]);
  const candidates = eligible.filter(
    (job) => !handled.has([job.id, hashDescription(job.description!)].join(":")),
  );
  if (!candidates.length) return 0;

  const tasks = candidates.map((job) => {
    const hash = hashDescription(job.description!);
    return {
      dedupe_key: [userId, job.id, profileVersion, hash, JOB_AI_ASSESSMENT_VERSION].join(":"),
      task_type: "job_fit_assessment",
      user_id: userId,
      job_id: job.id,
      profile_version: profileVersion,
      job_description_hash: hash,
      assessment_version: JOB_AI_ASSESSMENT_VERSION,
    };
  });

  const { data, error } = await db.rpc("enqueue_ai_job_assessment_tasks", {
    p_user_id: userId,
    p_tasks: tasks,
  });
  if (error) throw error;
  return data ?? 0;
}

export async function enqueueVisibleJobAssessments(userId: string, jobIds: string[]) {
  const uniqueIds = [...new Set(jobIds)].filter(Boolean);
  if (!uniqueIds.length) return 0;

  const profileVersion = await getConfirmedProfileVersion(userId);
  if (profileVersion === null) return 0;

  const { data, error } = await createServiceClient().from("jobs")
    .select("id,description")
    .in("id", uniqueIds);
  if (error) throw error;

  return enqueueJobRows(userId, profileVersion, data ?? []);
}

/**
 * Explicit backfill scans the full jobs catalogue in pages. Queue admission
 * is deduplicated by the database and is not capped by user or request.
 */
export async function enqueueAllJobAssessments(userId: string) {
  const profileVersion = await getConfirmedProfileVersion(userId);
  if (profileVersion === null) return { queued: 0, eligible: 0 };

  const db = createServiceClient();
  let queued = 0;
  let eligible = 0;
  let offset = 0;

  while (true) {
    const { data, error } = await db.from("jobs")
      .select("id,description")
      .order("id", { ascending: true })
      .range(offset, offset + BACKFILL_BATCH_SIZE - 1);
    if (error) throw error;

    const batch = data ?? [];
    if (!batch.length) break;
    eligible += batch.filter((job) => isUsableJobDescription(job.description)).length;
    queued += await enqueueJobRows(userId, profileVersion, batch);
    offset += batch.length;
    if (batch.length < BACKFILL_BATCH_SIZE) break;
  }

  return { queued, eligible };
}
