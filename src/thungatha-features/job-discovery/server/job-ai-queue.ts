import "server-only";

import {
  JOB_AI_ASSESSMENT_VERSION,
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
  isUsableJobDescription,
  getJobAiTaskStatus,
  retryFailedJobAiTask,
  requeueCompletedJobAiTask,
};

async function enqueueJobRows(
  userId: string,
  profileVersion: number,
  jobs: { id: string; description: string | null }[],
) {
  const eligible = jobs.filter((job) => isUsableJobDescription(job.description));
  if (!eligible.length) return 0;
  const tasks = eligible.map((job) => {
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
  const { data, error } = await createServiceClient().from("ai_task_queue")
    .upsert(tasks, { onConflict: "dedupe_key", ignoreDuplicates: true })
    .select("id");
  if (error) throw error;
  return data?.length ?? 0;
}

export async function enqueueVisibleJobAssessments(userId: string, jobIds: string[]) {
  const uniqueIds = [...new Set(jobIds)].filter(Boolean);
  if (!uniqueIds.length) return 0;
  const profileVersion = await getConfirmedProfileVersion(userId);
  if (profileVersion === null) return 0;
  const { data, error } = await createServiceClient().from("jobs")
    .select("id,description").in("id", uniqueIds);
  if (error) throw error;
  return enqueueJobRows(userId, profileVersion, data ?? []);
}

export async function enqueueAllJobAssessments(userId: string) {
  const profileVersion = await getConfirmedProfileVersion(userId);
  if (profileVersion === null) return { queued: 0, eligible: 0 };
  let queued = 0;
  let eligible = 0;
  const db = createServiceClient();
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await db.from("jobs")
      .select("id,description").order("id", { ascending: true }).range(offset, offset + 499);
    if (error) throw error;
    const batch = (data ?? []).filter((j) => isUsableJobDescription(j.description));
    eligible += batch.length;
    queued += await enqueueJobRows(userId, profileVersion, batch);
    if ((data ?? []).length < 500) break;
  }
  return { queued, eligible };
}
