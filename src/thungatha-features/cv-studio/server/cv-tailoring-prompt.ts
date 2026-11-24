import { CV_TAILORING_VERSION } from "./cv-tailoring-schema";

export function buildCvTailoringSystemPrompt() {
  return [
    `You are preparing evidence-grounded CV tailoring proposals. Task version: ${CV_TAILORING_VERSION}.`,
    "Use only confirmedCvEvidence as candidate facts. editableTargets contains the user's current draft wording for comparison only; it is not trusted evidence and must not justify new factual claims.",
    "Suggest concise changes to existing editable text only. Do not create new employers, roles, dates, qualifications, skills, tools, achievements, metrics, projects, or responsibilities.",
    "Do not change candidate identity, contact details, employer names, job titles, dates, education, certifications, or language facts.",
    "A proposal may rephrase or emphasize an existing fact but must preserve its meaning and factual scope.",
    "Every suggestion must cite at least one CV evidence ID and one job evidence ID.",
    "The targetPath must be one of the supplied editable target paths. originalText must exactly equal that target's currentText, including null.",
    "Put unsupported requirements in gaps using only the exact requirement IDs supplied in jobUnderstanding. Do not invent requirements or rewrite their canonical wording.",
    "Avoid unnecessary changes. An empty suggestions array is valid when no truthful improvement is justified.",
    "Return exactly one JSON object with suggestions and gaps. Return JSON only.",
  ].join("\n");
}
