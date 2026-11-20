import "server-only";
import { completeAiTask } from "@/lib/ai/provider-router";
import type { CandidateFacts } from "@/thungatha-features/user-profile/server/candidate-facts";
import { assertEvidenceReferences, buildJobEvidence, buildProfileEvidence } from "./job-ai-evidence";
import { jobUnderstandingSchema, matchAssessmentSchema } from "./job-ai-schemas";

const json = (value: unknown) => JSON.stringify(value);
function parse<T>(content: string, schema: { parse: (value: unknown) => T }): T {
  try { return schema.parse(JSON.parse(content)); }
  catch (cause) { throw new Error("AI returned output that failed the matching schema.", { cause }); }
}

export async function understandJobWithAi(title: string, description: string) {
  const evidence = buildJobEvidence(description);
  if (evidence.length === 0) throw new Error("The job description does not contain enough readable text.");
  const response = await completeAiTask({
    task: "job-requirement-extraction", responseFormat: "json",
    temperature: 0.1, maxOutputTokens: 5000, timeoutMs: 45_000, reasoning: true,
    systemPrompt: [
      "You are Thungatha's job-understanding engine.",
      "Understand the actual work described, not just the title or familiar keywords.",
      "Interpret the full advert. Do not use a fixed skill vocabulary or assume requirements absent from the source.",
      "Identify central responsibilities, capabilities, technologies, and explicit or clearly implied requirements.",
      "Use only supplied job evidence IDs. Every responsibility, capability, and requirement must cite one or more exact sourceEvidenceRefs.",
      "Classify importance as mandatory, preferred, or uncertain using context, not keyword triggers.",
      `Return this exact JSON shape: {summary:string,responsibilities:[{id:string,statement:string,sourceEvidenceRefs:string[]}],capabilities:[{id:string,name:string,context:string,sourceEvidenceRefs:string[]}],requirements:[{id:string,statement:string,category:"experience"|"skill"|"technology"|"qualification"|"certification"|"licence"|"language"|"location"|"work_mode"|"other",importance:"mandatory"|"preferred"|"uncertain",sourceEvidenceRefs:string[]}],coverage:"complete"|"partial"|"unavailable"}.`,
      "Return only valid JSON. No scores, percentages, role-family labels, or hiring predictions.",
    ].join("\n"),
    userPrompt: json({ title, sourceEvidence: evidence }),
  });
  const result = parse(response.content, jobUnderstandingSchema);
  const allowed = new Set(evidence.map((item) => item.id));
  const refs = [
    ...result.responsibilities.flatMap((item) => item.sourceEvidenceRefs),
    ...result.capabilities.flatMap((item) => item.sourceEvidenceRefs),
    ...result.requirements.flatMap((item) => item.sourceEvidenceRefs),
  ];
  if (!assertEvidenceReferences(refs, allowed)) throw new Error("AI job understanding referenced text that is not in the supplied job description.");
  return { analysis: result, provider: response.provider, model: response.model };
}

export async function assessJobWithAi(
  title: string, understanding: unknown, description: string, facts: CandidateFacts,
) {
  const jobEvidence = buildJobEvidence(description);
  const profileEvidence = buildProfileEvidence(facts);
  if (!jobEvidence.length || !profileEvidence.length) throw new Error("There is insufficient evidence to assess this role.");
  const response = await completeAiTask({
    task: "job-fit-assessment", responseFormat: "json",
    temperature: 0.1, maxOutputTokens: 6000, timeoutMs: 45_000, reasoning: true,
    systemPrompt: [
      "You are Thungatha's semantic job-to-candidate assessment engine.",
      "Compare the actual responsibilities, capabilities, tools, technologies, experience, qualifications, and context.",
      "Different titles can describe equivalent work. Titles and occupational categories are context only, never gates.",
      "The user next-role preference is a soft context signal only; it is not evidence of skills, experience, or qualification.",
      "Interpret every requirement in the full advert. No single phrase, qualification, experience duration, or missing Profile field is an automatic rejection rule.",
      "Transferable capabilities count when the supplied evidence supports the relationship. Do not invent experience or equivalence.",
      "Use only supplied jobEvidence and profileEvidence IDs. Cite exact IDs for every factual assessment. Never cite an ID you were not given.",
      "Missing Profile information means not demonstrated, not proof the candidate lacks the capability.",
      "Choose only Match, Relevant, or Unclassified. Match means strong evidence-based alignment with the central work. Relevant means meaningful supported alignment but material gaps or unknowns. Unclassified means evidence is insufficient, ambiguous, unsupported, or contradictory.",
      "A Match or Relevant result must cite at least one job evidence ID and one confirmed Profile evidence ID. Do not produce scores, percentages, weights, or hiring predictions.",
      `Return this exact JSON shape: {classification:"match"|"relevant"|"unclassified",summary:string,alignmentExplanation:string,requirements:[{id:string,requirement:string,assessment:"supported"|"not_demonstrated"|"contradictory"|"uncertain",explanation:string,jobEvidenceRefs:string[],profileEvidenceRefs:string[]}],gaps:[{description:string,jobEvidenceRefs:string[],profileEvidenceRefs:string[]}]}.`,
      "Return only valid JSON.",
    ].join("\n"),
    userPrompt: json({ title, jobUnderstanding: understanding, jobEvidence, confirmedProfileEvidence: profileEvidence, candidateFacts: { knownEmploymentMonths: facts.knownEmploymentMonths, employmentEvidenceRefs: facts.employmentEvidenceRefs, unknownEmploymentPeriodRefs: facts.unknownEmploymentPeriodRefs, targetRole: facts.targetRole } }),
  });
  const assessment = parse(response.content, matchAssessmentSchema);
  const jobRefs = new Set(jobEvidence.map((item) => item.id));
  const profileRefs = new Set(profileEvidence.map((item) => item.id));
  const allJobRefs = assessment.requirements.flatMap((item) => item.jobEvidenceRefs).concat(assessment.gaps.flatMap((item) => item.jobEvidenceRefs));
  const allProfileRefs = assessment.requirements.flatMap((item) => item.profileEvidenceRefs).concat(assessment.gaps.flatMap((item) => item.profileEvidenceRefs));
  if (!assertEvidenceReferences(allJobRefs, jobRefs) || !assertEvidenceReferences(allProfileRefs, profileRefs)) {
    throw new Error("AI assessment referenced evidence outside the supplied job description or confirmed Profile.");
  }
  if (assessment.classification !== "unclassified" &&
      (!allJobRefs.length || !allProfileRefs.length)) {
    throw new Error("AI assessment cannot be classified without traceable job and Profile evidence.");
  }
  return { assessment, provider: response.provider, model: response.model };
}
