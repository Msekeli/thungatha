import "server-only";
import {
  completeAiTask,
  completeAiTaskWithProvider,
} from "@/lib/ai/provider-router";
import type { AiProvider } from "@/lib/ai/contracts";
import { buildJobEvidence } from "@/thungatha-features/job-discovery/server/job-ai-evidence";
import { getOrCreateJobUnderstanding } from "@/thungatha-features/job-discovery/server/job-ai-understanding-cache";
import type { JobMatchingContext } from "@/thungatha-features/job-discovery/server/job-ai-queue-eligibility";
import type { JobUnderstanding } from "@/thungatha-features/job-discovery/server/job-ai-schemas";
import type { CvContent } from "./cv-studio-schema";
import { buildCvTailoringEvidence } from "./cv-tailoring-evidence";
import { buildCvTailoringSystemPrompt } from "./cv-tailoring-prompt";
import { mapCvTailoringOutput } from "./map-cv-tailoring-output";
import {
  CV_TAILORING_VERSION,
  createCvTailoringResponseSchema,
} from "./cv-tailoring-schema";

const EVIDENCE_STOP_WORDS = new Set([
  "about", "after", "also", "and", "are", "based", "been", "being", "can",
  "candidate", "demonstrate", "demonstrated", "experience", "from", "have",
  "into", "job", "more", "must", "role", "should", "that", "their", "them",
  "there", "these", "this", "through", "using", "with", "within", "work",
]);

function evidenceTerms(value: string) {
  return new Set(
    value.toLowerCase().match(/[a-z0-9+#.]{2,}/g)?.filter(
      (term) => !EVIDENCE_STOP_WORDS.has(term),
    ) ?? [],
  );
}

/**
 * Keep the model input focused on facts relevant to the advert. The mapper
 * still receives the complete evidence collection and validates every cited
 * reference against it; this only limits what is sent to the provider.
 */
function selectSummaryEvidence(
  evidence: Array<{ id: string; content: string }>,
  requirements: JobUnderstanding["requirements"],
  maxCharacters = 7_500,
) {
  const requirementText = requirements.map((item) => item.statement).join(" ");
  const jobTerms = evidenceTerms(requirementText);
  const ranked = evidence.map((item, index) => {
    const terms = evidenceTerms(item.content);
    let score = 0;
    for (const term of terms) if (jobTerms.has(term)) score += 1;
    if (item.id === "cv:professionalSummary") score += 3;
    if (item.id === "cv:headline") score += 2;
    if (item.id.startsWith("cv:technicalSkills")) score += 1;
    return { item, index, score };
  });
  ranked.sort((a, b) => b.score - a.score || a.index - b.index);

  const selected: Array<{ id: string; content: string }> = [];
  let usedCharacters = 0;
  for (const { item } of ranked) {
    if (selected.length >= 24 || usedCharacters >= maxCharacters) break;
    const remaining = maxCharacters - usedCharacters;
    const content = item.content.length > Math.min(700, remaining)
      ? item.content.slice(0, Math.min(700, remaining)).trimEnd()
      : item.content;
    if (!content) continue;
    selected.push({ id: item.id, content });
    usedCharacters += item.id.length + content.length;
  }
  return selected;
}

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
  const jobContext: JobMatchingContext = {
    title: job.title,
    employerName: job.company,
    locationText: job.location,
    description: job.description,
  };
  const understanding = await getOrCreateJobUnderstanding(jobContext);
  return generateCvTailoringSuggestionsFromUnderstanding(
    masterContent,
    draftContent,
    job,
    understanding.analysis,
  );
}

/** Shared tailoring pipeline; accepts an existing canonical understanding for isolated provider tests. */
export async function generateCvTailoringSuggestionsFromUnderstanding(
  masterContent: CvContent,
  draftContent: CvContent,
  job: CvTailoringJob,
  understanding: JobUnderstanding,
  provider?: Exclude<AiProvider, "ollama-cloud">,
) {
  const jobContext: JobMatchingContext = {
    title: job.title,
    employerName: job.company,
    locationText: job.location,
    description: job.description,
  };
  const { profileEvidence, editableTargets: allEditableTargets } =
    buildCvTailoringEvidence(masterContent, draftContent);
  // M4 currently reviews only the professional summary. Keep other CV sections
  // unchanged until their own section-by-section review experience is ready.
  const editableTargets = allEditableTargets.filter(
    (target) => target.path === "professionalSummary",
  );
  // A professional summary synthesizes confirmed facts from across the CV.
  // It must not be restricted to citing the old summary paragraph itself.
  const summaryEvidence = selectSummaryEvidence(
    profileEvidence,
    understanding.requirements,
  );
  const allJobEvidence = buildJobEvidence(job.description, jobContext);
  // The response classifies requirements, so only requirement-linked advert
  // excerpts are needed here; responsibilities/capabilities are not output.
  const referencedJobIds = new Set(
    understanding.requirements.flatMap((item) => item.sourceEvidenceRefs),
  );
  const jobEvidence = selectSummaryEvidence(
    allJobEvidence.filter((item) => referencedJobIds.has(item.id)),
    understanding.requirements,
    4_500,
  );
  if (!summaryEvidence.length || !jobEvidence.length || !editableTargets.length) {
    throw new Error("There is not enough confirmed evidence to tailor this CV.");
  }

  const schema = createCvTailoringResponseSchema(
    summaryEvidence.map((item) => item.id),
    jobEvidence.map((item) => item.id),
    editableTargets.map((item) => item.path),
    understanding.requirements.map((item) => item.id),
  );
  const request = {
    task: "cv-tailoring" as const,
    responseFormat: "json" as const,
    responseSchema: schema.responseSchema,
    temperature: 0.2,
    timeoutMs: 120_000,
    systemPrompt: buildCvTailoringSystemPrompt(),
    // The job description is already represented by jobEvidence and the
    // canonical understanding. Avoid sending a second copy of the advert.
    userPrompt: JSON.stringify({
      job: [job.title, job.company],
      understanding: {
        coverage: understanding.coverage,
        requirements: understanding.requirements.map((item) => [
          item.id,
          item.statement,
          item.category,
          item.importance,
          item.sourceEvidenceRefs,
        ]),
      },
      jobEvidence: jobEvidence.map((item) => [item.id, item.content]),
      // Keep the full confirmed Profile evidence for accurate requirement coverage.
      // Confirmed Profile facts across the CV may support the new summary proposal.
      confirmedCvEvidence: summaryEvidence.map((item) => [item.id, item.content]),
      editableTargets: editableTargets.map((item) => [item.path, item.currentText, item.profileEvidenceRef]),
    }),
  };
  const response = provider
    ? await completeAiTaskWithProvider(provider, request)
    : await completeAiTask(request);

  const parsed = schema.validator.parse(JSON.parse(response.content));
  const mapped = mapCvTailoringOutput(
    parsed,
    profileEvidence,
    jobEvidence,
    editableTargets,
    understanding.requirements,
  );
  return {
    ...mapped,
    provider: response.provider,
    model: response.model,
    taskVersion: CV_TAILORING_VERSION,
  };
}
