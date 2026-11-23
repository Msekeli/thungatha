import "server-only";

import { createHash } from "node:crypto";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import { cvJobContextSchema, type CvJobContextInput } from "./job-context-schema";

const MIN_DESCRIPTION_LENGTH = 200;

export async function resolveCvJobContext(
  userId: string,
  getToken: () => Promise<string | null>,
  input: CvJobContextInput,
) {
  let context: Omit<Parameters<typeof cvJobContextSchema.parse>[0], "descriptionFingerprint" | "retrievedAt">;

  if (input.source === "url") {
    throw new Error("URL_REQUIRES_DESCRIPTION");
  }

  if (input.source === "discovery") {
    const db = await createAuthenticatedSupabaseClient(getToken);
    const { data, error } = await db.from("jobs")
      .select("id,title,employer_name,description,location_text,application_url")
      .eq("id", input.jobId)
      .not("scout_vacancy_id", "is", null)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("JOB_NOT_FOUND");
    context = {
      source: "discovery",
      jobId: data.id,
      title: data.title,
      company: data.employer_name,
      location: data.location_text,
      sourceUrl: data.application_url,
      description: data.description ?? "",
    };
  } else {
    context = {
      source: "pasted",
      jobId: null,
      title: input.title,
      company: input.company ?? null,
      location: input.location ?? null,
      sourceUrl: input.sourceUrl ?? null,
      description: input.description,
    };
  }

  const description = context.description.trim();
  if (description.length < MIN_DESCRIPTION_LENGTH) throw new Error("JOB_DESCRIPTION_INSUFFICIENT");
  const fingerprint = createHash("sha256").update(description).digest("hex");
  return cvJobContextSchema.parse({
    ...context,
    description,
    descriptionFingerprint: fingerprint,
    retrievedAt: new Date().toISOString(),
  });
}
