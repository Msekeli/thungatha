# M3 — Job Matching and Fit Analysis

**Status:** In progress  
**Outcome:** Explainable categorical relevance classifications between a user's confirmed professional information and a job's requirements.  
**Dependencies:** M1 Job Discovery and M2 Profile/CV Import.

## Purpose and scope

M3 compares structured requirements extracted from job descriptions with evidence in the user's confirmed Profile. Results are categorical evidence-based relevance classifications, not scores or hiring predictions.

**M3 extraction and matching are rules-only.** Do not use AI, language models, embeddings, fuzzy matching, or Fuse.js in job requirement extraction, candidate fact derivation, role-family classification, evidence mapping, or relevance classification. Use deterministic parsing, explicit keyword rules, canonical identifiers, and reviewed alias dictionaries. Fuse.js may be evaluated separately for future Job Discovery search/autocomplete; that is outside M3.

The Profile remains the source of truth. Derive candidate facts with a pure deriveCandidateFacts(profile) function when needed; do not create a separate candidate-facts persistence table for the initial implementation. Do not treat unconfirmed CV-import drafts as candidate evidence.

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
- Canonical skill matching uses normalisation followed by exact lookup against an explicit alias dictionary. Do not blindly strip punctuation from identifiers such as C#, C++, .NET, or Node.js.
- Unknown or unsupported role titles are unclassified. Role family is contextual evidence, not proof of eligibility and not a standalone hard exclusion.
- Preserve the original job text and the exact source snippet/reference supporting every extracted requirement.
- Requirements not reliably detected remain absent/unknown and must be presented as such; never manufacture a requirement or a match.

## Checkpoint status rules

Use only: **Not started**, **In progress**, **Blocked**, **In review**, **Accepted**. Every checkpoint requires recorded evidence and review.

## Checkpoints

### M3-C01 — Relevance rules and classification specification

**Status:** In progress — rules approved by the user on 2026-11-20.

**Goal:** define deterministic relevance classification, evidence boundaries, and feed-ordering behaviour before implementation.

**Work**
- Define academic qualification comparison and the limits of NQF-based comparison.
- Define Matric/Grade 12/NSC normalisation and extraction of subject-specific minimum marks, including how percentages, grades, and ambiguous result formats are represented.
- Define qualification pathways with explicit AND/OR logic, including “diploma or degree”, “or equivalent experience”, and named professional/vendor certification alternatives.
- Define when professional certifications can satisfy a requirement and when they are supporting evidence only; never equate AWS/Azure credentials automatically to an academic qualification.
- Define whether and when relevant experience can substitute for a qualification where the advert explicitly says “or equivalent”.
- Agree the initial role-family vocabulary and deterministic word-boundary keyword rules.
- Define mandatory, preferred, and ambiguous requirement classification from explicit wording.
- Define requirement outcomes and the three relevance classifications, including unclassified behaviour.
- Numerical fit scores and percentages are explicitly rejected; do not implement them.
- Define how changes to the Profile, job description, extraction rules, or vocabulary invalidate/recompute an assessment.

**Approved rules (2026-11-20)**

- A school-leaving requirement and each subject/mark threshold are separate requirement nodes. The candidate must meet both when the advert states both.
- A requirement such as “Matric/Grade 12 with Mathematics at 50%” is not met merely because the Profile records Grade 12; the relevant Mathematics result must also be confirmed at or above the threshold.
- Qualification alternatives must be represented as explicit OR groups; conditions within a pathway are AND requirements. An “equivalent experience” path is available only when the employer's wording explicitly permits it.
- A vendor certification such as AWS or Azure may satisfy a named certification requirement. It may be accepted as an alternative to a diploma/degree only where the advert explicitly permits that alternative or an approved, evidence-backed equivalence rule exists. Otherwise it is additional relevant evidence, not a substitute for the academic qualification.

1. Requirement outcomes:
   - **Met:** confirmed evidence satisfies the requirement.
   - **Not met:** reliable evidence establishes that the requirement is not satisfied.
   - **Can't tell:** evidence is absent, incomplete, ambiguous, or unverifiable.
2. Requirement importance:
   - **Mandatory:** explicit wording such as “must”, “required”, “essential”, “minimum”, or “compulsory”, interpreted in context.
   - **Preferred:** explicit wording such as “preferred”, “advantageous”, “desirable”, or “nice to have”.
   - **Uncertain:** wording does not reliably establish either category; do not silently promote it to mandatory.
3. Overall relevance classification:
   - **Relevant:** there is clear, positive evidence of alignment between the confirmed candidate Profile and the job. Relevant mandatory requirements are met, or the job's supported role/skill evidence clearly aligns where requirements are limited.
   - **Partially relevant:** there is actual, identifiable alignment (for example, a related role family or some exact canonical skills), but material requirements are unmet or cannot be verified. It is not a catch-all for uncertainty.
   - **Unclassified:** the job or candidate evidence is insufficient, ambiguous, unsupported, or contradictory enough that relevance cannot be responsibly determined. Do not show a badge.
4. Missing Profile information is not evidence of a mismatch. Do not classify a job as partially relevant solely because information is missing.
5. Preferred requirements may enrich explanations but do not override mandatory requirement outcomes.
6. No numerical score, percentage, weighted total, or hiring-probability estimate is produced or displayed.
7. Display: Relevant uses the existing positive/green semantic token; Partially relevant uses the existing warning/yellow semantic token; Unclassified has no badge. Do not introduce local colour values or new tokens without review.
8. Sorting: **Most relevant** orders the full filtered catalogue by Relevant, then Partially relevant, then Unclassified; ties within a class use newest publication date first, then stable existing tie-breakers. Newest and Oldest remain date sorts and do not depend on Profile availability.
9. Candidate-specific classification requires a confirmed Profile. For visitors without a confirmed Profile, relevance is unavailable and Most relevant falls back to newest-first; do not invent a personalised result.
10. Relevance ordering must apply before pagination across the filtered catalogue, not only to the currently loaded page. If the implementation cannot guarantee that, it must not claim to provide catalogue-wide relevance sorting.

**Exit criteria**
- Education comparison, experience substitution, role families, mandatory/preferred rules, relevance classification definitions, and insufficient-information behaviour are approved.
- Worked examples cover met, not-met, unknown, ambiguous, and empty-requirement cases.
- No numerical score or percentage is produced or displayed.
- Relevance labels are described as evidence-based alignment, not a hiring prediction.

### M3-C02 — Job requirement extraction

**Status:** In progress — deterministic extraction v2 is implemented at Scout ingestion; verification and coverage expansion remain.

**Goal:** produce structured, reviewable requirements from job descriptions using deterministic rules.

**Work**
- Extract supported qualifications, experience, skills, responsibilities, licences/registrations, languages, location/work-mode constraints, and other explicitly supported requirements.
- Extract Matric/Grade 12/NSC requirements and subject-specific minimum marks as distinct structured conditions.
- Parse explicit alternative qualification pathways and AND/OR relationships without flattening them into a single qualification string.
- Extract named vendor/professional certifications separately from academic qualification requirements.
- Distinguish mandatory, preferred, and uncertain wording.
- Use explicit canonical vocabularies and aliases; no fuzzy matching.
- Preserve source snippets or offsets and the description hash/version.
- Validate extracted data against a runtime schema.
- Handle missing, malformed, short, contradictory, and partially populated descriptions.
- Extract requirements when a job is first imported and rerun only when its description content changes.

**Implementation record (2026-11-20)**
- Added a Zod schema for versioned extraction results and individual requirement records.
- Added SHA-256 description hashing and deterministic extraction for selected experience, qualification, named certification, canonical IT skill, licence/registration, and language patterns, plus title-based role-family vocabulary.
- Extraction v2 segments HTML paragraphs/list items and sentence boundaries, retains the matching source segment, gates extraction on requirement-context wording, deduplicates repeated category/value pairs, and limits language extraction to explicit proficiency phrases. These rules reduce incidental mentions but do not eliminate all false positives.
- Scout import reuses extraction only when both the exact description hash and extraction version match. The v2 version forces existing unchanged descriptions to be re-extracted on the next Scout import.
- Added a forward migration; it has not been applied to any database.
- Extraction remains deliberately partial. It does not yet reliably parse subject-specific marks, AND/OR qualification pathways, work-mode/location constraints, or every industry vocabulary. These remain unclassified rather than inferred.
- Added tests for hashing, mandatory experience, punctuation-sensitive skills, incidental mentions, HTML list source snippets, preferred wording, duplicate skills, explicit language proficiency, role family, and unavailable descriptions. Tests have not been run.

**Exit criteria**
- Requirements are schema-validated and traceable to source text.
- Unsupported requirements are not invented.
- Unrecognised terms remain unclassified/unknown and can be reviewed for future vocabulary updates.
- Extraction failure produces a safe unavailable/partial result.

### M3-C03 — Candidate fact derivation and evidence mapping

**Status:** In progress — Profile confirmation validation is corrected; candidate fact derivation has not started.

**Implementation record (2026-11-20)**
- Profile confirmation now validates the merged saved Profile plus incoming PATCH fields, rather than validating only the partial request body.
- A PATCH that omits `confirmedAt` clears confirmation. A caller must explicitly confirm again after making a partial update.
- Added integration-test coverage for confirming a partial update against a complete saved Profile and rejecting confirmation when the merged Profile remains incomplete. Tests have not been run.
- Candidate facts are not yet derived; this change only establishes a safer confirmation boundary.

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

### M3-C04 — Deterministic relevance classification

**Goal:** produce reproducible requirement outcomes and one of the approved relevance classifications.

**Work**
- Implement a pure comparison function over derived candidate facts and extracted job requirements.
- Do not calculate or expose a numerical score or percentage.
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

### M3-C06 — Job Discovery relevance sorting and integration

**Goal:** add matching to Discovery without making the feed dependent on matching availability.

**Work**
- Calculate classifications and order the full filtered catalogue before pagination. A page-only comparison is not catalogue-wide relevance sorting. The current planned catalogue ceiling is 5,000 jobs. Retrieve the full filtered set in bounded database pages, compare only structured requirement metadata in memory, order the complete filtered set, and paginate afterwards. Do not rank only the currently requested page.
- Do not classify only a loaded page and present it as catalogue-wide relevance sorting.
- Revisit indexed coarse filtering and ranking across a candidate pool only when catalogue growth or measured performance justifies it.
- Do not hard-filter on experience or education unless the requirement is explicitly mandatory and extraction is demonstrably reliable.
- Display a green Relevant badge or yellow Partially relevant badge only when classification is supported; Unclassified has no badge.
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
5. Whether the proposed tiers are accepted as written and the three relevance classifications and sort behaviour.
6. How target-role preference contributes, if at all, without becoming a hard filter.

C01 remains in progress for the unresolved vocabulary and detailed parsing boundaries. The user-approved relevance classifications and catalogue-ordering rules are sufficient to proceed with the separately scoped C02 extraction implementation.