import "server-only";

import { createClient } from "@supabase/supabase-js";
import { extractJobRequirements } from "./job-requirement-extractor";

const VERSION = "m3-c02-v2";
const PAGE_SIZE = 100;

export async function backfillJobRequirements(afterId?: string | null) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service-role configuration is missing.");

  const db = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  let query = db.from("jobs")
    .select("id,title,description,requirements_description_hash,requirements_extraction_version")
    .order("id", { ascending: true }).limit(PAGE_SIZE);
  if (afterId) query = query.gt("id", afterId);

  const { data, error } = await query;
  if (error) throw error;
  const jobs = data ?? [];
  let extracted = 0;
  let unchanged = 0;

  for (const job of jobs) {
    const result = extractJobRequirements(job.description ?? "", job.title ?? "");
    if (job.requirements_description_hash === result.descriptionHash &&
        job.requirements_extraction_version === VERSION) {
      unchanged += 1;
      continue;
    }
    const { error: updateError } = await db.from("jobs").update({
      extracted_requirements: result,
      requirements_description_hash: result.descriptionHash,
      requirements_extraction_version: result.extractionVersion,
      requirements_extraction_status: result.status,
    }).eq("id", job.id);
    if (updateError) throw updateError;
    extracted += 1;
  }

  return {
    scanned: jobs.length,
    extracted,
    unchanged,
    nextCursor: jobs.length === PAGE_SIZE ? jobs[jobs.length - 1].id : null,
  };
}
