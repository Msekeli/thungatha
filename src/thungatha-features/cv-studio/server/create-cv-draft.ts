import "server-only";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/http/api-response";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import { getCvDraftAuthContext } from "./cv-draft-route-auth";
import { createCvDraftSchema } from "./cv-draft-request-schema";
import { findReusableCvDraft } from "./cv-draft-repository";
import { handleCvDraftRouteError } from "./cv-draft-route-error";

export async function createCvDraft(request: Request) {
  const parsed = createCvDraftSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid draft request.", 400);
  }

  try {
    const auth = await getCvDraftAuthContext();
    if (auth.response || !auth.identity || !auth.profile) return auth.response;
    const db = await createAuthenticatedSupabaseClient(auth.identity.getToken);
    const { data: master, error: masterError } = await db
      .from("cv_versions")
      .select("id,source_profile_version,cv_kind,status,content,template_version,accent_colour")
      .eq("id", parsed.data.masterVersionId)
      .eq("user_id", auth.identity.userId)
      .maybeSingle();
    if (masterError) throw masterError;
    if (!master || master.cv_kind !== "master" || master.status !== "current") {
      return apiError("The current master CV could not be found.", 404);
    }
    if (master.source_profile_version !== auth.profile.profileVersion) {
      return apiError("Refresh your master CV before creating a draft.", 409);
    }
    const job = parsed.data.jobContext;
    if (job.jobId && job.source !== "discovery") {
      return apiError("The job reference is invalid.", 400);
    }

    const snapshot = {
      title: job.title,
      company: job.company,
      location: job.location,
      sourceUrl: job.sourceUrl,
      jobId: job.jobId,
      descriptionFingerprint: job.descriptionFingerprint,
    };
    const matchFilter = job.jobId
      ? `source_job_id.eq.${job.jobId},source_job_snapshot->>jobId.eq.${job.jobId}`
      : `source_job_snapshot->>descriptionFingerprint.eq.${job.descriptionFingerprint}`;
    const reusable = await findReusableCvDraft(
      db, auth.identity.userId, auth.profile.profileVersion, matchFilter,
    );
    if (reusable) return NextResponse.json({ draft: reusable, reusedDraft: true });

    const { data, error } = await db.from("cv_versions").insert({
      user_id: auth.identity.userId,
      cv_kind: "tailored",
      status: "draft",
      parent_version_id: master.id,
      source_profile_version: auth.profile.profileVersion,
      source_job_id: job.jobId,
      source_job_snapshot: snapshot,
      content: master.content,
      suggestions: [],
      tailoring_assessment: null,
      template_version: master.template_version,
      accent_colour: master.accent_colour,
    }).select(
      "id,version_number,status,content,suggestions,tailoring_assessment,accent_colour,source_job_snapshot,source_profile_version,parent_version_id",
    ).single();

    if (error?.code === "23505") {
      const raced = await findReusableCvDraft(
        db, auth.identity.userId, auth.profile.profileVersion, matchFilter,
      );
      if (raced) return NextResponse.json({ draft: raced, reusedDraft: true });
    }
    if (error) throw error;
    return NextResponse.json({ draft: data }, { status: 201 });
  } catch (error) {
    return handleCvDraftRouteError(error);
  }
}
