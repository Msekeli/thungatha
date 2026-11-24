import "server-only";
import { completeAiTask } from "@/lib/ai/provider-router";
import { buildJobEvidence } from "@/thungatha-features/job-discovery/server/job-ai-evidence";
import { getOrCreateJobUnderstanding } from "@/thungatha-features/job-discovery/server/job-ai-service";
import type { JobMatchingContext } from "@/thungatha-features/job-discovery/server/job-ai-queue-eligibility";
import type { CvContent, CvSuggestion } from "./cv-studio-schema";
import { buildCvTailoringEvidence } from "./cv-tailoring-evidence";
import {
  CV_TAILORING_VERSION,
  createCvTailoringResponseSchema,
} from "./cv-tailoring-schema";

export type CvTailoringJob = {
  title: string;
  company: string | null;
  location: string | null;
  description: string;
};

export async function generateCvTailoringSuggestions(
  masterContent: CvContent,
  draftContent: CvContent,
  job: CvTailoringJob,
) {
  const { profileEvidence, editableTargets } =
    buildCvTailoringEvidence(masterContent, draftContent);
  const jobContext: JobMatchingContext = {
    title: job.title,
    employerName: job.company,
    locationText: job.location,
    description: job.description,
  };
  const understanding = await getOrCreateJobUnderstanding(jobContext);
  const allJobEvidence = buildJobEvidence(job.description, jobContext);
  const referencedJobIds = new Set([
    ...understanding.analysis.responsibilities.flatMap((item) => item.sourceEvidenceRefs),
    ...understanding.analysis.capabilities.flatMap((item) => item.sourceEvidenceRefs),
    ...understanding.analysis.requirements.flatMap((item) => item.sourceEvidenceRefs),
  ]);
  const jobEvidence = allJobEvidence.filter((item) => referencedJobIds.has(item.id));
  if (!profileEvidence.length || !jobEvidence.length || !editableTargets.length) {
    throw new Error("There is not enough confirmed evidence to tailor this CV.");
  }

  const schema = createCvTailoringResponseSchema(
    profileEvidence.map((item) => item.id),
    jobEvidence.map((item) => item.id),
    editableTargets.map((item) => item.path),
  );
  const response = await completeAiTask({
    task: "cv-tailoring",
    responseFormat: "json",
    responseSchema: schema.responseSchema,
    temperature: 0.2,
    timeoutMs: 120_000,
    systemPrompt: [
      `You are preparing evidence-grounded CV tailoring proposals. Task version: ${CV_TAILORING_VERSION}.`,
      "Use only confirmedCvEvidence as candidate facts. editableTargets contains the user's current draft wording for comparison only; it is not trusted evidence and must not justify new factual claims.",
      "Suggest concise changes to existing editable text only. Do not create new employers, roles, dates, qualifications, skills, tools, achievements, metrics, projects, or responsibilities.",
      "Do not change candidate identity, contact details, employer names, job titles, dates, education, certifications, or language facts.",
      "A proposal may rephrase or emphasize an existing fact but must preserve its meaning and factual scope.",
      "Every suggestion must cite at least one CV evidence ID and one job evidence ID.",
      "The targetPath must be one of the supplied editable target paths. originalText must exactly equal that target's currentText, including null.",
      "Put requirements unsupported by the confirmed CV evidence in gaps. Do not invent wording to fill those gaps.",
      "Avoid unnecessary changes. An empty suggestions array is valid when no truthful improvement is justified.",
      "Return exactly one JSON object with suggestions and gaps. Return JSON only.",
    ].join("\n"),
    userPrompt: JSON.stringify({
      job: { title: job.title, company: job.company },
      jobUnderstanding: understanding.analysis,
      jobEvidence,
      confirmedCvEvidence: profileEvidence,
      editableTargets,
    }),
  });

  const parsed = schema.validator.parse(JSON.parse(response.content));
  const targetMap = new Map(editableTargets.map((item) => [item.path, item]));
  const seenTargets = new Set<string>();
  const suggestions: CvSuggestion[] = parsed.suggestions.map((item) => {
    if (seenTargets.has(item.targetPath)) {
      throw new Error("AI returned more than one suggestion for the same CV field.");
    }
    seenTargets.add(item.targetPath);
    const target = targetMap.get(item.targetPath);
    if (!target || item.originalText !== target.currentText) {
      throw new Error("AI returned a suggestion for changed or unknown CV text.");
    }
    return {
      id: crypto.randomUUID(),
      targetPath: item.targetPath,
      originalText: item.originalText,
      proposedText: item.proposedText,
      reason: item.reason,
      evidenceRefs: [...item.profileEvidenceRefs, ...item.jobEvidenceRefs],
      decision: "pending",
    };
  });
  return {
    suggestions,
    gaps: parsed.gaps,
    provider: response.provider,
    model: response.model,
    taskVersion: CV_TAILORING_VERSION,
  };
}
