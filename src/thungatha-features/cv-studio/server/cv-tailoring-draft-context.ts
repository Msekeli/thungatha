import "server-only";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/http/api-response";
import { resolveProfileIdentity } from "@/thungatha-features/user-profile/server/profile-route-auth";
import { cvContentSchema, type CvContent } from "./cv-studio-schema";
import { resolveCvJobContext } from "./job-context-service";
import type { CvTailoringRequest } from "./cv-tailoring-request-schema";
import {
  readCvTailoringDraft,
  readCvTailoringMaster,
  type CvTailoringDatabase,
  type CvTailoringDraft,
} from "./cv-tailoring-draft-repository";

type Identity = NonNullable<
  Awaited<ReturnType<typeof resolveProfileIdentity>>["identity"]
>;

export type CvTailoringDraftContext = {
  draft: CvTailoringDraft;
  masterContent: CvContent;
  draftContent: CvContent;
  job: Awaited<ReturnType<typeof resolveCvJobContext>>;
};

type PreparationResult =
  | { response: NextResponse; context?: never }
  | { response: null; context: CvTailoringDraftContext };

export async function prepareCvTailoringDraft(
  db: CvTailoringDatabase,
  identity: Identity,
  profileVersion: number,
  input: CvTailoringRequest,
): Promise<PreparationResult> {
  const draft = await readCvTailoringDraft(db, identity.userId, input.draftId);
  if (!draft || draft.cv_kind !== "tailored") {
    return { response: apiError("This tailored draft could not be found.", 404) };
  }
  if (draft.status !== "draft") {
    return { response: apiError("Only an unaccepted draft can be tailored.", 409) };
  }
  if (draft.source_profile_version !== profileVersion) {
    return {
      response: apiError(
        "Your Profile has changed. Refresh the master CV and create a new draft.",
        409,
      ),
    };
  }

  const job = await resolveCvJobContext(identity.getToken, input.job);
  const snapshot = draft.source_job_snapshot as {
    title?: string;
    company?: string | null;
    location?: string | null;
    descriptionFingerprint?: string;
    jobId?: string | null;
  } | null;
  const jobMismatch =
    snapshot?.descriptionFingerprint !== job.descriptionFingerprint ||
    snapshot.title !== job.title ||
    snapshot.company !== job.company ||
    snapshot.location !== job.location ||
    (job.jobId && draft.source_job_id !== job.jobId) ||
    (snapshot?.jobId && snapshot.jobId !== job.jobId);
  if (jobMismatch) {
    return { response: apiError("The job context does not match this CV draft.", 409) };
  }
  if (!draft.parent_version_id) {
    return {
      response: apiError("The master CV linked to this draft could not be found.", 409),
    };
  }

  const master = await readCvTailoringMaster(
    db, identity.userId, draft.parent_version_id,
  );
  if (
    !master ||
    master.cv_kind !== "master" ||
    master.status !== "current" ||
    master.source_profile_version !== profileVersion
  ) {
    return { response: apiError("The current master CV could not be found.", 409) };
  }

  return {
    response: null,
    context: {
      draft,
      masterContent: cvContentSchema.parse(master.content),
      draftContent: cvContentSchema.parse(draft.content),
      job,
    },
  };
}
