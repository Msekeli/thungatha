export function buildJobUnderstandingPrompt() {
  return [
    "Understand the complete job advert in context, not just its title or familiar keywords.",
    "Identify only material responsibilities, capabilities, and requirements that affect the actual work or candidate suitability.",
    "Preserve semantic meaning, equivalent terminology, transferable work context, and explicit versus uncertain wording.",
    "Combine duplicate or closely related items. Do not produce exhaustive paraphrases, generic soft skills, benefits, or boilerplate.",
    "Include every material responsibility, capability, and requirement supported by the advert. Do not impose arbitrary item-count limits or silently omit material information.",
    "Every item must cite the exact supplied job evidence IDs that support it. Do not invent evidence references or omit material supporting evidence.",
    "Classify requirement importance as mandatory, preferred, or uncertain using the context of the full advert, not isolated keyword triggers.",
    "Keep each statement concise. Return a short role-purpose summary.",
    "Return one JSON object at the root. Do not wrap it in a result, data, job, analysis, or response property. Do not return an array or prose.",
    "Required root object fields: summary (string), responsibilities (array of objects with id, statement, sourceEvidenceRefs), capabilities (array of objects with id, name, context, sourceEvidenceRefs), requirements (array of objects with id, statement, category, importance, sourceEvidenceRefs), and coverage (complete, partial, or unavailable).",
    "Every object and every listed property is required, including when an array is empty. Use empty arrays when no items exist. Do not replace arrays of objects with strings.",
    "Use only the allowed category and importance values stated below. IDs must be short unique strings within this response. Evidence references must be exact IDs from sourceEvidence.",
    "Requirement categories: experience, skill, technology, qualification, certification, licence, language, location, work_mode, other.",
    "Return only valid JSON. No scores, percentages, role-family labels, or hiring predictions.",
  ].join("\n");
}

export function buildAssessmentRepairPrompt() {
  return [
    "Repair the supplied candidate assessment into syntactically valid JSON.",
    "This is a syntax-only repair. Preserve every identifier, assessment, explanation, and evidence reference exactly.",
    "Do not add, remove, infer, summarize, or change any information. Do not invent evidence references.",
    "Return one JSON object only, with top-level fields semanticAlignment, summary, alignmentExplanation, requirements, and gaps.",
    "Each requirement item contains only id, assessment, explanation, jobEvidenceRefs, and profileEvidenceRefs.",
    "If a value is malformed or incomplete, preserve the available content and use only the minimum syntax correction needed.",
  ].join("\\n");
}

export function buildJobAssessmentPrompt() {
  return [
    "Assess the actual work and material requirements against the candidate's confirmed Profile evidence.",
    "Recognise equivalent responsibilities and transferable capabilities when evidence supports the relationship. Titles are context, never gates.",
    "Target-role preference is soft context, not proof of skill or experience. Missing Profile information means not demonstrated, not proof of inability.",
    "Input format: jobUnderstanding has coverage plus responsibilities tuples [id, statement, jobEvidenceRefs], capabilities tuples [id, name, context, jobEvidenceRefs], and requirements tuples [id, statement, category, importance, jobEvidenceRefs]. jobEvidence and confirmedProfileEvidence are [exactEvidenceId, verbatimEvidenceContent] tuples.",
    "Use only supplied evidence IDs. Cite exact IDs for factual claims. Do not invent, alter, or infer evidence references.",
    "Assess every extracted requirement exactly once. Return its exact ID only; do not repeat requirement wording or importance. Application code attaches canonical wording and importance.",
    "A supported requirement must cite confirmed Profile evidence. Every requirement must cite job evidence. Explain material gaps and uncertainty clearly and concisely.",
    "If no material requirements or responsibilities were extracted, return insufficient alignment. Do not calculate scores, percentages, weights, rankings, or hiring predictions.",
    "Return semanticAlignment as strong, meaningful, or insufficient and state whether material gaps remain. Application code derives Match or Relevant; insufficient evidence produces unavailable, not a third classification.",
    "Return one JSON object with exactly these fields: semanticAlignment, summary, alignmentExplanation, requirements, gaps.",
    "semanticAlignment: level, materialGaps, jobEvidenceRefs, profileEvidenceRefs. Each requirement: id, assessment (supported, not_demonstrated, contradictory, uncertain), explanation, jobEvidenceRefs, profileEvidenceRefs. Each gap: description, jobEvidenceRefs, profileEvidenceRefs.",
    "Return every requirement exactly once. Use no additional fields. Return JSON only.",
  ].join("\\n");
}
