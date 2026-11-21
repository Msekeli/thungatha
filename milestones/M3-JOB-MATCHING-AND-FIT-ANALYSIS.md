# M3 — AI-Powered Job Matching and Relevance

**Status:** In progress  
**Outcome:** AI-powered semantic comparison of actual job responsibilities and requirements with confirmed candidate evidence, producing explainable Match, Relevant, or Unclassified outcomes.  
**Dependencies:** M1 Job Discovery and M2 Profile/CV Import.

## Purpose and scope

M3 is a core AI capability in Thungatha. AI must understand job descriptions in context and semantically compare the actual work and requirements with evidence in the user's confirmed Profile. Do not reduce this milestone to deterministic extraction, exact keyword overlap, or job-title/role-family matching.

AI is responsible for contextual interpretation, identifying responsibilities and capabilities, recognising equivalent work expressed through different titles or terminology, identifying transferable skills, comparing job requirements with candidate evidence, and preparing grounded explanations. Application code validates AI output and evidence references and enforces approved categorical rules, security, persistence, freshness, and state transitions.

Do not require embeddings as a prerequisite. Use provider-supported semantic language understanding directly unless evaluation demonstrates that a separate embedding capability is needed. Fuse.js may be evaluated separately for future Job Discovery search/autocomplete; it is not a substitute for semantic AI matching.

The Profile remains the source of truth. Derive reliable candidate facts with a pure `deriveCandidateFacts(profile)` function when needed; do not create a separate candidate-facts persistence table for the initial implementation. Candidate facts and Profile evidence references are deterministic inputs to AI comparison, not a replacement for semantic interpretation. Do not treat unconfirmed CV-import drafts as candidate evidence.

## Global matching principles

- AI interprets the complete job description and compares the actual work with confirmed Profile evidence. Do not make regexes, fixed vocabularies, exact-string matching, title similarity, role-family taxonomies, or manually maintained requirement mappings the semantic decision engine.
- Consider responsibilities, expected outcomes, capabilities, tools, technologies, experience, qualifications, certifications, licences, languages, seniority, domain context, and transferable experience where relevant. No single field is a universal gate.
- Job titles and role-family labels are context only. Different titles may describe equivalent work; similar titles alone do not prove equivalence.
- Interpret qualifications, subject marks, credentials, experience durations, mandatory/preferred wording, and alternative pathways in the context of the full advert. Do not turn an individual phrase, threshold, or requirement into automatic rejection or a mechanical overall classification.
- Preserve important distinctions between evidence types. AI may explain whether evidence is directly equivalent, related, transferable, not demonstrated, contradictory, or uncertain; it must not invent equivalence or silently assume mismatch.
- Missing Profile information means not demonstrated, not that the candidate lacks the capability. Incomplete dates and ambiguous facts remain uncertain.
- Use only confirmed Profile evidence for candidate-side factual claims. Imported CV information remains a draft until confirmed.
- Preserve source evidence for job-side claims and confirmed Profile evidence references for candidate-side claims. Application code validates every reference and rejects unsupported claims.
- No numerical fit scores, percentages, weights, thresholds, weighted totals, hidden numeric rankings, or hiring probabilities.
- Exactly three overall outcomes: Match, Relevant, and Unclassified. Match requires strong evidence-based alignment with the central work; Relevant requires meaningful supported alignment but material gaps or unknowns; Unclassified means the available evidence is insufficient, ambiguous, unsupported, or contradictory.
- Requirement-level observations explain the assessment; they must not become a rigid checklist total or hidden scoring system.
- Keep deterministic code for validation, authorization, ownership, persistence, freshness, sorting, and state transitions. These safeguards do not replace AI semantic interpretation.

## Checkpoint status rules

Use only: **Not started**, **In progress**, **Blocked**, **In review**, **Accepted**. Every checkpoint requires recorded evidence and review.

## Checkpoints

### M3-C01 — Semantic matching rules and classification specification

**Status:** In progress — categorical labels and semantic AI direction approved on 2026-11-21; detailed qualification and evaluation cases remain.

**Goal:** define AI-assisted semantic comparison, evidence boundaries, categorical outcomes, and feed-ordering behaviour before implementation.

**Work**
- Define the evidence contract and source-reference validation for job descriptions and confirmed Profile snapshots.
- Define how AI interprets responsibilities, capabilities, skills, tools, technologies, experience, qualifications, certifications, licences, languages, and relevant domain context.
- Define how the model handles equivalent work across different titles, transferable skills, alternative pathways, ambiguous wording, and incomplete evidence.
- Define how mandatory/preferred wording is interpreted in the context of the full advert without keyword-triggered rejection.
- Define the versioned AI task/output schema, uncertainty handling, provider failure behaviour, freshness, and invalidation.
- Define the approved Match, Relevant, and Unclassified outcomes.
- No numerical scoring of any kind.

**Requirement-level interpretation**
- Use concise evidence states such as supported, not demonstrated, contradictory, and uncertain.
- Do not treat a missing Profile field as proof that a requirement is not met.
- Do not turn subject marks, named credentials, years of experience, qualification levels, or phrases such as must/required into universal hard gates. Interpret their significance in context and explain uncertainty.
- Preserve meaningful distinctions between qualifications, certifications, registrations, and licences without hard-coding universal equivalence or substitution rules.
- The overall category reflects the full semantic comparison, not a checklist total or one isolated requirement.

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

**Status:** In progress — the deterministic extractor is an interim legacy implementation and must be replaced as the semantic understanding engine.

**Historical implementation record (preserved for traceability)**
- The existing implementation added description hashing, a versioned schema, regex/pattern extraction for selected requirement categories, fixed skill aliases, role-family vocabulary, source snippets, and a protected backfill path.
- These mechanisms were useful for the initial prototype but have known coverage and false-positive limitations. They must not determine or gate the final semantic assessment.
- Existing extraction versions, migration state, backfill status, and test results must be verified during the implementation audit. Do not claim migrations or tests are complete without evidence.

**Goal:** produce structured, reviewable, source-grounded understanding of job descriptions using AI.

**Work**
- Use AI to understand the role's purpose, central responsibilities, expected outcomes, capabilities, tools, technologies, experience expectations, qualifications, certifications, licences, languages, and relevant context.
- Interpret any relevant skills, technologies, industries, and responsibilities present in the supplied text; do not limit understanding to a predefined dictionary.
- Interpret mandatory, preferred, alternative, and uncertain requirements from the complete advert rather than isolated keyword triggers.
- Preserve source excerpts or stable evidence references for every material interpretation.
- Distinguish explicit source statements from model interpretation; do not invent missing requirements or fill gaps with industry assumptions.
- Validate structured output against a versioned schema and verify that every cited excerpt belongs to the exact current job description.
- Reuse prior results only when the description hash and relevant task/schema versions match.
- Incomplete, malformed, contradictory, or short descriptions must produce an honest limited/unknown result, not fabricated detail.

**Exit criteria**
- AI understands job content beyond exact keyword and title overlap.
- No fixed dictionary, regex rule, or role-family mapping gates the interpretation or final category.
- Every material job-side claim is traceable to the current source text.
- Failure produces a safe unavailable/partial state and does not block ordinary Discovery.

### M3-C03 — Candidate fact derivation and evidence mapping

**Status:** In progress — pure candidate fact derivation and authenticated Profile read path are implemented; evidence mapping and coverage remain.

**Implementation record (2026-11-20)**
- Profile confirmation validates the merged saved Profile plus incoming PATCH fields, rather than validating only the partial request body.
- A PATCH that omits `confirmedAt` clears confirmation. A caller must explicitly confirm again after making a partial update.
- Integration-test coverage was added for confirming a partial update against a complete saved Profile and rejecting confirmation when the merged Profile remains incomplete. Tests have not been run.
- Added pure `deriveCandidateFacts(profile, asOfDate)` derivation. It returns no facts for an unconfirmed or incomplete Profile and includes the Profile version and confirmation timestamp for traceability.
- Derived facts preserve the full set of relevant confirmed professional evidence, including employment history and descriptions, responsibilities, achievements, projects, skills, tools, education, qualifications, certifications, licences, languages, and Profile source paths. Exact aliases may assist normalization but must not limit what AI can understand.
- Employment dates are parsed only for `YYYY-MM`, `YYYY-MM-DD`, and month-name/year formats. Current roles use the explicit `isCurrent` flag and supplied `asOfDate`; unsupported or invalid periods remain listed as unknown. Overlapping and adjacent known periods are merged before counting known employment months.
- Unit tests cover confirmation gating, incomplete Profiles, overlapping employment periods, unparseable dates, punctuation-sensitive skill aliases, separate credential collections, target role, and languages. Tests have not been run.
- Added `readCandidateFacts(userId, getToken, asOfDate)` as the server-side entry point. It reads only the authenticated user's Profile through the existing user-scoped repository, maps the saved row to the Profile DTO, and delegates to the pure derivation. It returns no candidate facts when no Profile exists or the Profile is unconfirmed/incomplete.
- Candidate fact derivation is an initial slice. It does not yet derive role-family evidence, NQF levels, subject marks, or qualification equivalence, and it does not classify job relevance.
- **2026-11-21 implementation increment:** Added `deriveCandidateFacts(profile, asOfDate)` under `src/thungatha-features/user-profile/server/`. It rejects unconfirmed/incomplete Profiles, preserves source paths across employment, responsibilities, achievements, projects, skills, education, qualifications, certifications/licences, languages and personal attributes, and derives known employment months without double-counting overlaps. Only the supported date formats are counted; unknown periods remain explicitly referenced. Added the user-scoped `readCandidateFacts` entry point and wired the AI worker to pass these derived facts to semantic assessment. Focused unit tests were added but have not been executed. C03 remains in progress pending evidence-coverage review and verification.


**Goal:** derive reliable candidate facts from the complete confirmed Profile and map every comparison claim to its supporting evidence. These deterministic facts support, but do not replace, AI semantic interpretation.

**Work**
- Implement a pure `deriveCandidateFacts(profile)` function using the complete saved Profile, not a partial PATCH payload.
- Initially derive facts on read; do not add a candidate-facts table unless measured cost justifies it.
- Derive reliable employment periods and experience totals without double-counting overlaps.
- Treat unparseable dates as unknown; do not guess.
- Preserve the original Profile evidence and meaningful distinctions between qualifications, certifications, registrations, and licences. Do not impose universal equivalence rules.
- Include relevant work descriptions, responsibilities, achievements, projects, and outcomes alongside structured Profile fields so AI can understand actual capabilities, not just labels.
- Map candidate evidence to Profile field references and expose only confirmed facts as candidate evidence.
- Never promote unconfirmed CV-import data to confirmed evidence.

**Exit criteria**
- Every candidate-side claim is traceable to confirmed Profile evidence.
- Positive, absent, contradictory, overlapping-date, and unparseable-date examples are covered.
- Missing evidence is not misrepresented as proof of absence.

### M3-C04 — AI semantic evidence assessment and categorical classification

**Status:** In progress — AI semantic assessment and application-owned categorical classification are implemented; representative evaluation and verification remain outstanding.

**Historical implementation record (2026-11-20; preserved as interim baseline)**
- Added a pure classifier that consumes confirmed candidate facts and schema-validated extracted job requirements. It returns one categorical relevance label, a rule version, and requirement-level outcomes; it does not calculate a score.
- Added deterministic comparisons for exact canonical skills, exact language names, exact named certifications, supported school-leaving aliases, generic diploma/degree type wording, and minimum whole-year experience requirements.
- Experience uses merged known employment months. If known experience is below the threshold but one or more employment periods are unparseable, the outcome remains Can't tell; it becomes Not met only when all recorded employment periods are reliably known.
- Unsupported categories and unverified qualification equivalence remain Can't tell. No NQF equivalence, subject-mark inference, role-family inference, or qualification substitution is attempted.
- The interim classifier used the earlier Relevant / Partially relevant / Unclassified labels. D-050 supersedes those labels with Match / Relevant / Unclassified.
- The current extractor emitted `partial` for every non-empty extraction, limiting the interim classifier's ability to return a positive result. This is a known limitation of the previous implementation, not a constraint on the approved AI semantic assessment.
- The implementation is intentionally conservative. Requirement-level outcomes support only the evidence types listed above; unsupported categories remain Can't tell. Unit tests were added for exact skill evidence, missing skills, empty employment history, positive alignment with an unmet mandatory experience requirement, and unavailable/empty extraction. Tests have not been run.

This record describes the earlier deterministic classifier only. It does not satisfy the approved semantic comparison requirement and must not be used as a substitute for AI assessment.

**2026-11-21 implementation increment:** The AI assessment schema now returns a semantic alignment level, material-gap declaration, and explicit overall evidence references instead of a category. Application code validates all overall, requirement, and gap references against the exact supplied job description and confirmed Profile evidence, then derives Match, Relevant, or Unclassified using a versioned policy. Strong alignment with no material gaps yields Match; meaningful alignment, material gaps, or contradictory requirement evidence yields Relevant; insufficient alignment or no overall Profile evidence yields Unclassified. Supported requirements must cite confirmed Profile evidence. The AI task version was incremented to invalidate prior assessment and understanding cache entries. Focused policy/schema tests were added but have not been run.

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

**2026-11-21 implementation increment:** The authenticated assessment endpoint resolves assessment references to exact job-description segments and confirmed Profile fields. The match breakdown displays supporting excerpts beside requirements and gaps, and exposes job-understanding coverage so partial or unavailable extraction remains visible. Profile evidence is returned only through the authenticated, user-scoped endpoint. A database function now locks the task, job, and Profile rows and performs the freshness check, assessment upsert, and task completion in one transaction. This prevents job/Profile updates from racing the persistence operation.

**Status:** In progress — evidence-linked explanations, user-facing evidence display, extraction-coverage warnings, and atomic assessment persistence are implemented. Database migration application and verification remain.

**2026-11-21 implementation increment:** The worker now delegates persistence to `persist_job_match_assessment`. The function locks the queue task, job, and Profile rows, verifies the exact job description plus Profile version and confirmation timestamp, and atomically writes the assessment and completes the task. Stale inputs complete the task without writing an assessment; database errors roll back the transaction. The former non-atomic pre-write check has been removed.
- **Persistence contract hardening:** A follow-up migration adds a locked queue-task hash comparison before invoking the atomic persistence function. The worker passes the hash it originally claimed, so the task's stored description hash must still match that exact input before an assessment can be written.

**Goal:** make AI-generated results understandable, evidence-grounded, uncertainty-aware, and resistant to stale or unsupported claims.

**Work**
- Explain why actual responsibilities and capabilities align or differ, including equivalent work expressed through different titles and transferable skills.
- Explain which aspects are supported, not demonstrated, contradictory, or uncertain. Avoid implying that a missing Profile field proves a requirement is not met.
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
- Use persisted, current AI assessments for relevance ordering. Assessments must be generated asynchronously and keyed to the exact job-description and confirmed Profile versions; feed requests must not call AI synchronously.
- Apply Match, Relevant, Unclassified ordering to the full filtered catalogue before pagination using cached assessment categories, with stable date tie-breakers.
- Do not hard-filter or reject a job based on AI-interpreted candidate fit. Keep user-selected objective discovery filters (such as location, work mode, employment type, date, and explicit search terms) separate from candidate matching.
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

## Role-family handling

Role-family taxonomies are not required for M3. If an occupational domain is useful in an explanation, it is contextual only. Never require a family assignment or use a family vocabulary as a gate, filter, score, or deciding factor.

## Decisions still required at M3-C01

1. Whether a higher NQF level can satisfy a lower-level requirement when qualification types or fields differ. Recommendation: not automatically; compare qualification type and field, and require explicit employer equivalence or validated mapping.
2. How to interpret “degree or equivalent experience”. Recommendation: allow experience as an alternative only when the advert explicitly permits it, with a separately agreed relevant-experience rule.
3. Exact mandatory/preferred/uncertain phrase rules and treatment of context-dependent wording.
4. Evaluation examples for transferable skills and cross-title/cross-industry equivalence.
5. How target-role preference contributes as a soft contextual signal without becoming a hard filter.

C01 remains in progress for representative semantic evaluation and evidence interpretation. Do not turn qualification equivalence examples or requirement wording into universal hard-coded rules. The user-approved Match / Relevant / Unclassified labels and catalogue-ordering rules are sufficient to proceed with AI-assisted C02/C04 implementation. The existing deterministic extractor and classifier are interim implementations, not the approved end state.