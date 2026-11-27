import "server-only";
import {
  JOB_AI_ASSESSMENT_VERSION,
  createJobMatchingContext,
  createServiceClient,
  hashDescription,
  hashJobContext,
  isUsableJobDescription,
} from "./job-ai-queue-eligibility";

type JobRow = {
  id: string;
  title: string;
  employer_name: string | null;
  location_text: string | null;
  description: string | null;
};

export async function enqueueJobRows(
  userId: string,
  profileVersion: number,
  jobs: JobRow[],
) {
  const eligible = jobs
    .filter((job) => isUsableJobDescription(job.description))
    .map((job) => ({ job, context: createJobMatchingContext(job) }));
  if (!eligible.length) return 0;

  const db = createServiceClient();
  const jobIds = eligible.map(({ job }) => job.id);
  const [queueResult, assessmentResult] = await Promise.all([
    db
      .from("ai_task_queue")
      .select("job_id,job_context_hash")
      .eq("user_id", userId)
      .eq("profile_version", profileVersion)
      .eq("assessment_version", JOB_AI_ASSESSMENT_VERSION)
      .in("job_id", jobIds),
    db
      .from("job_match_assessments")
      .select("job_id,job_context_hash")
      .eq("user_id", userId)
      .eq("profile_version", profileVersion)
      .eq("assessment_version", JOB_AI_ASSESSMENT_VERSION)
      .in("job_id", jobIds),
  ]);
  if (queueResult.error) throw queueResult.error;
  if (assessmentResult.error) throw assessmentResult.error;

  const handled = new Set([
    ...(queueResult.data ?? []).map((item) =>
      [item.job_id, item.job_context_hash].join(":"),
    ),
    ...(assessmentResult.data ?? []).map((item) =>
      [item.job_id, item.job_context_hash].join(":"),
    ),
  ]);
  const candidates = eligible.filter(
    ({ job, context }) =>
      !handled.has([job.id, hashJobContext(context)].join(":")),
  );
  if (!candidates.length) return 0;

  const tasks = candidates.map(({ job, context }) => {
    const contextHash = hashJobContext(context);
    return {
      dedupe_key: [
        userId,
        job.id,
        profileVersion,
        contextHash,
        JOB_AI_ASSESSMENT_VERSION,
      ].join(":"),
      task_type: "job_fit_assessment",
      user_id: userId,
      job_id: job.id,
      profile_version: profileVersion,
      job_description_hash: hashDescription(context.description),
      job_context_hash: contextHash,
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
