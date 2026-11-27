import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/http/api-response";
import { cvSuggestionSchema, type CvSuggestion } from "./cv-studio-schema";
import {
  generateCvTailoringSuggestions,
  generateCvWorkExperienceSuggestions,
} from "./cv-tailoring-service";
import type { CvTailoringRequest } from "./cv-tailoring-request-schema";
import type { CvTailoringDraftContext } from "./cv-tailoring-draft-context";
import type { CvTailoringDatabase } from "./cv-tailoring-draft-repository";

export async function generateAndSaveCvTailoringDraft(
  db: CvTailoringDatabase,
  userId: string,
  input: CvTailoringRequest,
  context: CvTailoringDraftContext,
) {
  let generatedSuggestions: CvSuggestion[];
  let generationMetadata: {
    provider: string;
    model: string;
    taskVersion: string;
  };
  let nextAssessment = context.draft.tailoring_assessment;

  if (input.section === "professionalSummary") {
    const result = await generateCvTailoringSuggestions(
      context.masterContent,
      context.draftContent,
      context.job,
    );
    generatedSuggestions = result.suggestions;
    generationMetadata = {
      provider: result.provider,
      model: result.model,
      taskVersion: result.taskVersion,
    };
    nextAssessment = {
      coveredRequirementIds: result.coveredRequirementIds,
      gaps: result.gaps,
      provider: result.provider,
      model: result.model,
      taskVersion: result.taskVersion,
      generatedAt: new Date().toISOString(),
    };
  } else {
    const result = await generateCvWorkExperienceSuggestions(
      context.masterContent,
      context.draftContent,
      context.job,
      input.experienceSourceId,
    );
    generatedSuggestions = result.suggestions;
    generationMetadata = {
      provider: result.provider,
      model: result.model,
      taskVersion: result.taskVersion,
    };
  }

  const existing = z
    .array(cvSuggestionSchema)
    .max(200)
    .parse(context.draft.suggestions ?? []);
  const prefix =
    input.section === "workExperience"
      ? `workExperience[${input.experienceSourceId}].`
      : null;
  const isTargeted = (path: string) =>
    input.section === "professionalSummary"
      ? path === "professionalSummary"
      : Boolean(prefix && path.startsWith(prefix));
  const merged = [
    ...existing.filter(
      (item) => !isTargeted(item.targetPath) || item.decision !== "pending",
    ),
    ...generatedSuggestions,
  ];
  if (merged.length > 200) {
    return apiError(
      "This draft has reached its suggestion history limit. Start a new tailored draft to continue.",
      409,
    );
  }

  const { data: saved, error } = await db
    .from("cv_versions")
    .update({
      suggestions: merged,
      tailoring_assessment: nextAssessment,
      updated_at: new Date().toISOString(),
    })
    .eq("id", context.draft.id)
    .eq("user_id", userId)
    .eq("status", "draft")
    .select("id,suggestions,tailoring_assessment")
    .single();
  if (error) throw error;
  if (!saved) return apiError("The tailored draft is no longer editable.", 409);
  return NextResponse.json({
    ...generationMetadata,
    generatedSuggestions,
    assessment: saved.tailoring_assessment,
  });
}
