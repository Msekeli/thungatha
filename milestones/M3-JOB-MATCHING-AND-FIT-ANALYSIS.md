# M3 — Job Matching and Fit Analysis

**Status:** Not started  
**Outcome:** An explainable, evidence-based fit assessment between a user's confirmed professional information and a job's requirements.  
**Dependencies:** M1 Job Discovery and M2 Profile/CV Import.

## Purpose and scope

M3 compares structured requirements extracted from job descriptions with evidence in the user's confirmed Profile. A fit result is an estimate of evidence-based alignment, not a probability of being hired.

**M3 extraction and matching are rules-only.** Do not use AI, language models, embeddings, fuzzy matching, or Fuse.js in job requirement extraction, candidate fact derivation, role-family classification, evidence mapping, or scoring. Use deterministic parsing, explicit keyword rules, canonical identifiers, and reviewed alias dictionaries. Fuse.js may be evaluated separately for future Job Discovery search/autocomplete; that is outside M3.

The Profile remains the source of truth. Derive candidate facts with a pure deriveCandidateFacts(profile) function when needed; do not create a separate candidate-facts persistence table for the initial implementation. Do not treat unconfirmed CV-import drafts as candidate evidence.

## Global matching rules

- Preserve the distinction between **Confirmed**, **Inferred**, **Missing**, and **Can't verify** evidence where applicable.
- Missing Profile information is not proof that a person lacks a qualification, skill, experience, licence, or language.
- Unparseable or incomplete employment dates are unknown. Never convert them to zero experience, guess dates, or infer duration from free text that cannot be reliably interpreted.
- Merge overlapping employment periods before calculating total experience; never double-count concurrent roles. Count only reliably parsed periods and expose uncertainty where dates are incomplete.
- Academic qualifications, professional certifications, registrations, and licences are separate evidence types. NQF levels apply to registered qualifications, not automatically to certifications or licences.
- Do not assume qualifications are equivalent merely because they share an NQF level. Preserve qualification type, name, field, and verified NQF level.
- Canonical skill matching uses normalisation followed by exact lookup against an explicit alias dictionary. Do not blindly strip punctuation from identifiers such as C#, C++, .NET, or Node.js.
- Unknown or unsupported role titles are unclassified. Role family is contextual evidence, not proof of eligibility and not a standalone hard exclusion.
- Preserve the original job text and the exact source snippet/reference supporting every extracted requirement.
- Requirements not reliably detected remain absent/unknown and must be presented as such; never manufacture a requirement or a match.

## Checkpoint status rules

Use only: **Not started**, **In progress**, **Blocked**, **In review**, **Accepted**. Every checkpoint requires recorded evidence and review.

## Checkpoints

### M3-C01 — Matching rules and score specification

**Goal:** agree on the meaning, boundaries, evidence states, and fit-tier rules before implementation.

**Work**
- Define academic qualification comparison and the limits of NQF-based comparison.
- Define whether and when relevant experience can substitute for a qualification where the advert explicitly says “or equivalent”.
- Agree the initial role-family vocabulary and deterministic word-boundary keyword rules.
- Define mandatory, preferred, and ambiguous requirement classification from explicit wording.
- Define requirement outcomes and overall fit tiers, including insufficient-information behaviour.
- Decide whether a numerical percentage is required for the initial release. Do not invent weights or display precision before approval.
- Define how changes to the Profile, job description, extraction rules, or vocabulary invalidate/recompute an assessment.

**Proposed rules for review — not yet approved**

1. Requirement outcomes:
   - **Met:** confirmed evidence satisfies the requirement.
   - **Not met:** reliable evidence establishes that the requirement is not satisfied.
   - **Can't tell:** evidence is absent, incomplete, ambiguous, or unverifiable.
2. Requirement importance:
   - **Mandatory:** explicit wording such as “must”, “required”, “essential”, “minimum”, or “compulsory”, interpreted in context.
   - **Preferred:** explicit wording such as “preferred”, “advantageous”, “desirable”, or “nice to have”.
   - **Uncertain:** wording does not reliably establish either category; do not silently promote it to mandatory.
3. Overall tiers:
   - **Strong:** every reliably extracted mandatory requirement is met.
   - **Possible:** no mandatory requirement is confirmed not met, but at least one is can't tell.
   - **Stretch:** at least one mandatory requirement is confirmed not met.
   - **Insufficient information:** no reliable mandatory requirement can be extracted. This takes precedence over strong, preventing an empty requirement set from looking like a perfect match.
4. Preferred requirements may enrich explanations but do not override a failed mandatory requirement. Numerical scoring and weights remain open until separately agreed.

**Exit criteria**
- Education comparison, experience substitution, role families, mandatory/preferred rules, tier definitions, and insufficient-information behaviour are approved.
- Worked examples cover met, not-met, unknown, ambiguous, and empty-requirement cases.
- Any numerical score and its weights are explicitly approved or deferred.
- The score/result is described as a fit estimate, not hiring probability.

### M3-C02 — Job requirement extraction

**Goal:** produce structured, reviewable requirements from job descriptions using deterministic rules.

**Work**
- Extract supported qualifications, experience, skills, responsibilities, licences/registrations, languages, location/work-mode constraints, and other explicitly supported requirements.
- Distinguish mandatory, preferred, and uncertain wording.
- Use explicit canonical vocabularies and aliases; no fuzzy matching.
- Preserve source snippets or offsets and the description hash/version.
- Validate extracted data against a runtime schema.
- Handle missing, malformed, short, contradictory, and partially populated descriptions.
- Extract requirements when a job is first imported and rerun only when its description content changes.

**Exit criteria**
- Requirements are schema-validated and traceable to source text.
- Unsupported requirements are not invented.
- Unrecognised terms remain unclassified/unknown and can be reviewed for future vocabulary updates.
- Extraction failure produces a safe unavailable/partial result.

### M3-C03 — Candidate fact derivation and evidence mapping

**Goal:** derive comparable facts from the complete confirmed Profile and map each requirement to its supporting evidence.

**Work**
- Implement a pure deriveCandidateFacts(profile) function using the complete saved Profile, not a partial PATCH payload.
- Initially derive facts on read; do not add a candidate-facts table unless measured cost justifies it.
- Derive reliable employment periods and experience totals without double-counting overlaps.
- Treat unparseable dates as unknown; do not guess.
- Preserve qualification type, name, field, and verified NQF information separately from certifications and licences.
- Normalize skills through exact canonical identifiers and a reviewed alias dictionary.
- Map evidence to each requirement and retain Profile field references.
- Never promote unconfirmed CV-import data to confirmed evidence.

**Exit criteria**
- Every comparison is traceable to confirmed Profile evidence.
- Positive, partial, absent, contradictory, overlapping-date, and unparseable-date examples are covered.
- Missing evidence is not misrepresented as proof of absence.

### M3-C04 — Deterministic fit assessment

**Goal:** produce reproducible requirement outcomes and approved overall tiers.

**Work**
- Implement a pure comparison function over derived candidate facts and extracted job requirements.
- Keep requirement outcome logic separate from any optional presentation percentage.
- Apply only the C01-approved rules.
- Handle unknown requirements, no mandatory requirements, incomplete Profile data, and conflicting evidence consistently.
- Version the rules/vocabulary used for an assessment.

**Exit criteria**
- Identical inputs and rule version produce identical results.
- Unit tests cover all requirement states, tiers, boundaries, and empty/unknown cases.
- No fuzzy or AI-derived decision can change an eligibility outcome.

### M3-C05 — Explanation, uncertainty and freshness

**Goal:** make results understandable and prevent misleading stale assessments.

**Work**
- Explain which requirements are met, not met, or cannot be determined.
- Show source evidence from the job and corresponding confirmed Profile evidence.
- Explain limitations and distinguish missing evidence from lack of qualification.
- Recompute on read initially; detect changes to Profile version, job description hash, or matching-rule version.
- Do not persist stale results as current.

**Exit criteria**
- Explanations trace to job and Profile evidence.
- Relevant input/rule changes cause recalculation or an explicit stale state.
- Unknown and partial extraction states remain visible.

### M3-C06 — Job Discovery integration

**Goal:** add matching to Discovery without making the feed dependent on matching availability.

**Work**
- Calculate comparisons in memory for the current catalogue size; the initial implementation does not need SQL-side candidate-pool ranking or a background job.
- Do not score only a loaded page and present it as catalogue-wide relevance sorting.
- Revisit indexed coarse filtering and ranking across a candidate pool only when catalogue growth or measured performance justifies it.
- Do not hard-filter on experience or education unless the requirement is explicitly mandatory and extraction is demonstrably reliable.
- Display a tier or percentage only when a valid assessment exists.
- Handle missing Profile, unavailable descriptions, insufficient information, and analysis failure.
- Preserve existing search, filters, sorting, details, save, and dismiss behaviour.

**Exit criteria**
- Discovery never fabricates a match or blocks the feed waiting for analysis.
- Matching unavailability does not break existing Discovery behaviour.
- Displayed outcomes agree with the deterministic comparison rules.

### M3-C07 — Calibration, verification and acceptance

**Goal:** validate the rules across representative jobs and Profiles.

**Work**
- Assemble approximately 50 anonymised job descriptions across several industries.
- Hand-label supported requirements, mandatory/preferred status, experience, education, licences/registrations, languages, and location constraints.
- Compare extraction output with the labels; report precision/recall or clear error counts by requirement category rather than relying on one aggregate accuracy figure.
- Review false positives especially carefully because they can incorrectly tell a user they meet a mandatory requirement.
- Test repeatability, overlap/date uncertainty, unknown evidence, stale-state handling, and extraction failures.
- Record supported industries, vocabulary coverage, known limitations, and examples.

**Acceptance criteria**
- Extraction and comparison are deterministic, explainable, and reviewed against labelled examples.
- False-positive behaviour for mandatory requirements is explicitly assessed.
- Can't verify and missing evidence are not treated as negative proof.
- Matching integrates with Discovery and is reusable by CV Studio.
- Evidence is recorded and the user explicitly accepts M3.

## Initial role-family vocabulary

The initial proposed families are Software & IT, Engineering, Finance & Accounting, Administration, Healthcare, Sales & Marketing, Human Resources, Operations & Logistics, Education, Hospitality, and Security. This list is a starting vocabulary, not an exhaustive taxonomy. Use explicit keywords with word boundaries; ambiguous titles return unclassified. Final terms and overlap precedence require C01 review.

## Decisions still required at M3-C01

1. Whether a higher NQF level can satisfy a lower-level requirement when qualification types or fields differ. Recommendation: not automatically; compare qualification type and field, and require explicit employer equivalence or validated mapping.
2. How to interpret “degree or equivalent experience”. Recommendation: allow experience as an alternative only when the advert explicitly permits it, with a separately agreed relevant-experience rule.
3. Final role-family list, keywords, and precedence where a title matches multiple families.
4. Exact mandatory/preferred/uncertain phrase rules and treatment of context-dependent wording.
5. Whether the proposed tiers are accepted as written and whether a numeric percentage is deferred.
6. How target-role preference contributes, if at all, without becoming a hard filter.

No implementation should begin until C01 rules are reviewed and approved.