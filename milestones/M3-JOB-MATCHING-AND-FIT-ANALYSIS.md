# M3 — AI-Powered Job Matching and Relevance

**Status:** In progress  
**Outcome:** AI-powered semantic comparison of actual job responsibilities and requirements with confirmed candidate evidence, producing explainable Match, Relevant, or Unclassified outcomes.  
**Dependencies:** M1 Job Discovery and M2 Profile/CV Import.

## Purpose and scope

M3 is a core AI capability in Thungatha. AI must understand job descriptions in context and semantically compare the actual work and requirements with evidence in the user's confirmed Profile. Do not reduce this milestone to deterministic extraction, exact keyword overlap, or job-title/role-family matching.

AI is responsible for contextual interpretation, identifying responsibilities and capabilities, recognising equivalent work expressed through different titles or terminology, identifying transferable skills, comparing job requirements with candidate evidence, and preparing grounded explanations. Application code validates AI output and evidence references and enforces approved categorical rules, security, persistence, freshness, and state transitions.

Do not require embeddings as a prerequisite. Use provider-supported semantic language understanding directly unless evaluation demonstrates that a separate embedding capability is needed. Fuse.js may be evaluated separately for future Job Discovery search/autocomplete; it is not a substitute for semantic AI matching.

The Profile remains the source of truth. Derive reliable candidate facts with a pure `deriveCandidateFacts(profile)` function when needed; do not create a separate candidate-facts persistence table for the initial implementation. Candidate facts and Profile evidence references are deterministic inputs to AI comparison, not a replacement for semantic interpretation. Do not treat unconfirmed CV-import drafts as candidate evidence.

## Global matching rules

- Preserve the distinction between **Confirmed**, **Inferred**, **Missing**, and **Can't verify** evidence where applicable.
- Missing Profile information is not proof that a person lacks a qualification, skill, experience, licence, or language.
- Unparseable or incomplete employment dates are unknown. Never convert them to zero experience, guess dates, or infer duration from free text that cannot be reliably interpreted.
- Merge overlapping employment periods before calculating total experience; never double-count concurrent roles. Count only reliably parsed periods and expose uncertainty where dates are incomplete.
- Academic qualifications, professional certifications, registrations, and licences are separate evidence types. NQF levels apply to registered qualifications, not automatically to certifications or licences.
- Treat **Matric**, **Grade 12**, and **National Senior Certificate (NSC)** as possible aliases for the same school-leaving qualification only when the source context supports that interpretation. Preserve the employer's exact wording and extracted qualification type.
- Extract subject-specific school results as separate requirements: subject, minimum percentage/grade, mandatory/preferred status, and source evidence. A general Grade 12 match does not satisfy a separate Mathematics, Physical Sciences, or other subject-mark threshold. Do not infer that Mathematical Literacy satisfies Mathematics, or convert symbols/grades to percentages without a verified conversion rule.
- Represent qualification pathways as explicit alternatives and conjunctions. For example, “relevant diploma or degree, or equivalent experience” is an OR between pathways, while “Grade 12 with Mathematics at 50%” is an AND between the school qualification and the subject threshold.
- Treat vendor and professional certifications (for example, AWS or Microsoft Azure credentials) as distinct credential evidence, not as academic diplomas/degrees or automatic NQF equivalents. They may satisfy a named certification requirement or an explicitly accepted alternative pathway; otherwise they can support relevant technical capability without replacing a formal academic requirement.
- Do not assume qualifications are equivalent merely because they share an NQF level. Preserve qualification type, name, field, and verified NQF level.
- Exact canonical skill aliases may provide direct evidence, but they are not the sole matching method. AI must also interpret semantically related and transferable capabilities expressed with different wording. Preserve technical distinctions in identifiers such as C#, C++, .NET, and Node.js.
- Job titles and role-family labels are contextual evidence only, never hard gates or deciding factors. Different titles may describe substantially equivalent responsibilities and capabilities; similar titles alone do not prove equivalent work.
- Preserve the original job text and exact source snippet/reference supporting every AI-interpreted job requirement or claim.
- Every candidate-side factual claim must reference confirmed Profile evidence. Validate all source and Profile references against trusted records after schema validation.
- Requirements not reliably detected remain absent/unknown and must be presented as such; never manufacture a requirement or a match.

## Checkpoint status rules

Use only: **Not started**, **In progress**, **Blocked**, **In review**, **Accepted**. Every checkpoint requires recorded evidence and review.

## Checkpoints

### M3-C01 — Semantic matching rules and classification specification

**Status:** In progress — categorical labels and semantic AI direction approved on 2026-11-21; detailed qualification and evaluation cases remain.

**Goal:** define AI-assisted semantic comparison, evidence boundaries, categorical outcomes, and feed-ordering behaviour before implementation.

**Work**
- Define academic qualification comparison and the limits of NQF-based comparison.
- Define Matric/Grade 12/NSC normalisation and extraction of subject-specific minimum marks, including percentages, grades, and ambiguous result formats.
- Define qualification pathways with explicit AND/OR logic, including “diploma or degree”, “or equivalent experience”, and named professional/vendor certification alternatives.
- Define when professional certifications can satisfy a requirement and when they are supporting evidence only; never equate AWS/Azure credentials automatically to an academic qualification.
- Define whether and when relevant experience can substitute for a qualification where the advert explicitly says “or equivalent”.
- Define how titles and role families may provide context without becoming hard gates; include equivalent responsibilities across different titles and industries.
- Define mandatory, preferred, and ambiguous requirement interpretation from explicit wording and context.
- Define AI assessment schema, source evidence references, confirmed Profile evidence references, validation, uncertainty handling, and provider failure behaviour.
- Define the approved **Match**, **Relevant**, and **Unclassified** outcomes.
- No numerical scoring of any kind: no scores, percentages, weights, thresholds, weighted totals, fit points, score bands, hidden numeric rankings, or hiring-probability estimates.
- Define how changes to the Profile, job description, model/task prompt, schema, or business rules invalidate/recompute an assessment.

**Approved qualification principles (2026-11-20)**
- A school-leaving requirement and each subject/mark threshold are separate requirement nodes. The candidate must meet both when the advert states both.
- A requirement such as “Matric/Grade 12 with Mathematics at 50%” is not met merely because the Profile records Grade 12; the relevant Mathematics result must also be confirmed at or above the threshold.
- Qualification alternatives must be represented as explicit OR groups; conditions within a pathway are AND requirements. An “equivalent experience” path is available only when the employer's wording explicitly permits it.
- A vendor certification such as AWS or Azure may satisfy a named certification requirement. It may be accepted as an alternative to a diploma/degree only where the advert explicitly permits that alternative or an approved, evidence-backed equivalence rule exists. Otherwise it is additional relevant evidence, not a substitute for the academic qualification.

**Requirement outcomes**
- **Met:** confirmed evidence satisfies the requirement.
- **Not met:** reliable evidence establishes that the requirement is not satisfied.
- **Can't tell:** evidence is absent, incomplete, ambiguous, or unverifiable.

**Requirement importance**
- **Mandatory:** explicit wording such as “must”, “required”, “essential”, “minimum”, or “compulsory”, interpreted in context.
- **Preferred:** explicit wording such as “preferred”, “advantageous”, “desirable”, or “nice to have”.
- **Uncertain:** wording does not reliably establish either category; do not silently promote it to mandatory.

**Overall relevance labels**
- **Match:** strong, supported alignment with the central work and core/mandatory requirements, grounded in confirmed Profile evidence. Different titles or industries do not prevent Match when the underlying work and capabilities substantially align.
- **Relevant:** meaningful supported alignment exists, including transferable skills or related responsibilities, but material gaps, unknowns, or incomplete evidence prevent a strong Match conclusion.
- **Unclassified:** evidence is insufficient, ambiguous, unsupported, or materially contradictory. Do not show a badge.

Missing Profile information is not evidence of a mismatch. Preferred requirements may enrich explanations but do not override mandatory requirement outcomes.

**Display and sorting**
- Match uses the existing positive/green semantic token; Relevant uses the existing informational/blue semantic token; Unclassified has no badge.
- “Most relevant” orders the full filtered catalogue by Match, then Relevant, then Unclassified. Ties use newest publication date and existing stable tie-breakers. Newest and Oldest remain date sorts.
- Candidate-specific classification requires a confirmed Profile. Without one, do not fabricate relevance; Most relevant falls back to newest-first.
- Relevance ordering must apply before pagination across the filtered catalogue, not only to the currently loaded page.

**Exit criteria**
- Qualification comparison, experience substitution, mandatory/preferred interpretation, and uncertainty rules are documented.
- Worked examples cover equivalent work under different titles, cross-industry transferability, met/not-met/unknown requirements, ambiguous descriptions, and insufficient evidence.
- AI assessments are grounded in source job text and confirmed Profile evidence.
- No numerical score of any kind is calculated, stored, returned, displayed, or used for sorting.

### M3-C02 — AI-assisted job understanding and requirement extraction

**Status:** In progress — deterministic extraction v2 exists as an interim implementation at Scout ingestion; it does not yet satisfy the approved semantic AI target.

**Goal:** produce structured, reviewable, source-grounded understanding of job descriptions using AI-assisted semantic interpretation.

**Work**
- Use AI to interpret responsibilities, skills, technologies/tools, qualifications, experience, certifications, licences/registrations, languages, location/work-mode constraints, and relevant domain context.
- Interpret the meaning of requirements beyond literal wording and recognise related capabilities expressed with different terminology.
- Extract Matric/Grade 12/NSC requirements and subject-specific minimum marks as distinct structured conditions.
- Parse explicit alternative qualification pathways and AND/OR relationships without flattening them into a single qualification string.
- Distinguish mandatory, preferred, and uncertain wording.
- Preserve source snippets/offsets and the description hash/version for every extracted or interpreted requirement.
- Validate structured output against a versioned runtime schema and verify that each cited snippet belongs to the current job description.
- Handle missing, malformed, short, contradictory, and partially populated descriptions without inventing requirements.
- Reuse prior results only when the exact description hash and task/schema version match.

**Interim implementation record (2026-11-20; deterministic extractor only, not acceptance of the AI target)**
- A Zod schema, description hashing, source snippets, deterministic extraction patterns, and a protected backfill path were added.
- The current extractor covers selected experience, qualification, named certification, canonical IT skill, licence/registration, and language patterns. It is deliberately partial and does not reliably interpret every industry or equivalent responsibility.
- This implementation is useful as a structured baseline, but it does not provide the approved contextual semantic understanding and must not be treated as the final M3 AI capability.
- Existing tests and migration/backfill status are recorded in the implementation history. Do not claim tests have passed or migrations have been applied unless separately verified.

**Exit criteria**
- Requirements are schema-validated and traceable to source text.
- AI can interpret relevant meaning beyond exact keyword and title overlap.
- Unsupported requirements are not invented.
- Extraction failure produces a safe unavailable/partial result and does not block ordinary Discovery.

### M3-C03 — Candidate fact derivation and evidence mapping

**Status:** In progress — pure candidate fact derivation and authenticated Profile read path are implemented; evidence mapping and coverage remain.

**Goal:** derive reliable candidate facts from the complete confirmed Profile and map every comparison claim to its supporting evidence. These deterministic facts support, but do not replace, AI semantic interpretation.

**Work**
- Implement a pure `deriveCandidateFacts(profile)` function using the complete saved Profile, not a partial PATCH payload.
- Initially derive facts on read; do not add a candidate-facts table unless measured cost justifies it.
- Derive reliable employment periods and experience totals without double-counting overlaps.
- Treat unparseable dates as unknown; do not guess.
- Preserve qualification type, name, field, and verified NQF information separately from certifications and licences.
- Preserve raw skill evidence and exact canonical aliases where useful; do not treat exact aliases as the only way to recognise capability.
- Map candidate evidence to Profile field references and expose only confirmed facts as candidate evidence.
- Never promote unconfirmed CV-import data to confirmed evidence.

**Exit criteria**
- Every candidate-side claim is traceable to confirmed Profile evidence.
- Positive, absent, contradictory, overlapping-date, and unparseable-date examples are covered.
- Missing evidence is not misrepresented as proof of absence.

### M3-C04 — AI semantic evidence assessment and categorical classification

**Status:** In progress — the existing deterministic comparison is an interim slice; AI semantic assessment and evidence validation remain outstanding.

**Interim implementation record (2026-11-20; deterministic classifier only, not acceptance of the AI target)**
- A pure classifier currently compares a limited set of exact canonical skills, language names, named certifications, school-leaving aliases, generic qualification wording, and minimum experience requirements.
- It demonstrates some deterministic evidence and uncertainty handling, but it cannot adequately recognise equivalent responsibilities across different titles, transferable skills, or contextual relationships across industries.
- This implementation is not the approved end state. Do not treat exact keyword overlap or deterministic title/role-family rules as equivalent to semantic AI comparison.

**Goal:** use AI to interpret job and candidate evidence semantically, then produce validated requirement outcomes and one of the approved categorical labels.

**Work**
- Implement a feature-owned AI use case that compares structured job context with confirmed candidate facts and returns a strict, versioned schema.
- Require source job evidence references and confirmed Profile evidence references for factual claims; validate every reference in application code.
- Recognise equivalent responsibilities and transferable skills across different titles and industries; titles and role families are context only.
- Include material gaps, conflicting evidence, unknowns, and uncertainty in the structured result instead of guessing.
- Apply the approved Match / Relevant / Unclassified categorical rules after AI interpretation and evidence validation.
- Do not calculate, store, return, expose, or sort by any numerical score or hidden numeric ranking.
- Version the model/task prompt, schema, relevant rules, and source/Profile inputs used for an assessment.
- Evaluate model output against representative human-reviewed examples, including misleading similar titles and equivalent work with different titles.

**Exit criteria**
- AI recognises equivalent work across different titles and industries and identifies transferable skills without title gates.
- Every factual assessment claim is traceable to source job text and confirmed Profile evidence; unsupported claims are rejected or marked unknown.
- Application-side evidence validation and categorical rules are repeatable and tested independently of the model.
- Tests cover false positives, false negatives, requirement states, unknown/ambiguous cases, provider failures, invalid schemas, invalid evidence references, and stale results.
- No numerical score of any kind is calculated, stored, returned, displayed, or used for sorting.

### M3-C05 — Explanation, uncertainty and freshness

**Goal:** make AI-generated results understandable, evidence-grounded, uncertainty-aware, and resistant to stale or unsupported claims.

**Work**
- Explain why actual responsibilities and capabilities align or differ, including equivalent work expressed through different titles and transferable skills.
- Explain which requirements are met, not met, or cannot be determined.
- Show the source job snippet/reference and corresponding confirmed Profile evidence for each factual claim.
- Explain limitations and distinguish missing evidence from lack of qualification. Never present an AI inference as confirmed evidence.
- Recompute or mark stale when Profile version, job description hash, AI task/prompt/schema version, or relevant business rules change.
- Do not persist stale results as current.

**Exit criteria**
- Explanations trace to job and confirmed Profile evidence.
- Relevant input, task, or rule changes cause recalculation or an explicit stale state.
- Unknown and partial extraction states remain visible.

### M3-C06 — Job Discovery relevance sorting and integration

**Goal:** add matching to Discovery without making the feed dependent on matching availability.

**Work**
- Calculate classifications and order the full filtered catalogue before pagination. A page-only comparison is not catalogue-wide relevance sorting. The current planned catalogue ceiling is 5,000 jobs. Retrieve the full filtered set in bounded database pages, compare only structured requirement metadata in memory, order the complete filtered set, and paginate afterwards. Do not rank only the currently requested page.
- Do not classify only a loaded page and present it as catalogue-wide relevance sorting.
- Revisit indexed coarse filtering and ranking across a candidate pool only when catalogue growth or measured performance justifies it.
- Do not hard-filter on experience or education unless the requirement is explicitly mandatory and extraction is demonstrably reliable.
- Display a green Match badge or blue Relevant badge only when classification is supported; Unclassified has no badge.
- Handle missing Profile, unavailable descriptions, insufficient information, and analysis failure.
- Preserve existing search, filters, sorting, details, save, and dismiss behaviour.

**Exit criteria**
- Discovery never fabricates a match or blocks the feed waiting for analysis.
- Matching unavailability does not break existing Discovery behaviour.
- Displayed outcomes agree with the validated AI assessment, evidence references, and application-owned categorical rules. AI unavailability must not be disguised as keyword matching.

### M3-C07 — Calibration, verification and acceptance

**Goal:** validate the rules across representative jobs and Profiles.

**Work**
- Assemble representative anonymised job descriptions and confirmed Profile examples across multiple industries and role families, including substantially equivalent work with different job titles.
- Hand-label responsibilities, skills, tools/technologies, mandatory/preferred requirements, experience, education, licences/registrations, languages, transferable skills, and source evidence.
- Evaluate semantic equivalence and transferable-skill recognition beyond literal wording; include misleading similar titles and unrelated roles with overlapping keywords.
- Report precision/recall or clear false-positive/false-negative counts by requirement and scenario rather than relying on one aggregate figure or score.
- Review false positives carefully because they can incorrectly tell a user their evidence satisfies a mandatory requirement.
- Test source grounding, Profile evidence references, uncertainty, provider failures, stale-state handling, and repeatability of application-side categorical rules.
- Record supported industries, vocabulary coverage, known limitations, and examples.

**Acceptance criteria**
- AI-assisted semantic extraction and comparison are explainable, evidence-grounded, and reviewed against labelled examples.
- False-positive behaviour for mandatory requirements is explicitly assessed.
- Can't verify and missing evidence are not treated as negative proof.
- Matching integrates with Discovery and is reusable by CV Studio.
- Evidence is recorded and the user explicitly accepts M3.

## Initial role-family vocabulary

The initial proposed families are Software & IT, Engineering, Finance & Accounting, Administration, Healthcare, Sales & Marketing, Human Resources, Operations & Logistics, Education, Hospitality, and Security. This list is an optional contextual aid, not an exhaustive taxonomy or a classification gate. AI must compare actual responsibilities and capabilities even when a title is unfamiliar, ambiguous, or belongs to another industry. Do not require exact family assignment or title-keyword matching before semantic comparison.

## Decisions still required at M3-C01

1. Whether a higher NQF level can satisfy a lower-level requirement when qualification types or fields differ. Recommendation: not automatically; compare qualification type and field, and require explicit employer equivalence or validated mapping.
2. How to interpret “degree or equivalent experience”. Recommendation: allow experience as an alternative only when the advert explicitly permits it, with a separately agreed relevant-experience rule.
3. Exact mandatory/preferred/uncertain phrase rules and treatment of context-dependent wording.
4. Evaluation examples for transferable skills and cross-title/cross-industry equivalence.
5. How target-role preference contributes as a soft contextual signal without becoming a hard filter.

C01 remains in progress for qualification equivalence, requirement interpretation, and representative semantic evaluation cases. The user-approved Match / Relevant / Unclassified labels and catalogue-ordering rules are sufficient to proceed with AI-assisted C02/C04 implementation. The existing deterministic extractor and classifier are interim implementations, not the approved end state.