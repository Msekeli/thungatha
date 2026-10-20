# M3 — Job Matching and Fit Analysis

**Status:** Not started  
**Outcome:** An explainable, evidence-based fit assessment between a user's confirmed professional information and a job's requirements.  
**Design reference:** Job Discovery · Dark.png, which shows a match percentage and a match-details panel.  
**Dependencies:** M1 Job Discovery and M2 Profile/CV Import.

## Purpose and scope

Provide the matching capability used by Discovery and CV Studio. A match score is an estimate of evidence-based fit, not a probability of getting hired. Matching must distinguish “the user does not have this” from “the available profile/CV does not prove this” and from “this cannot be verified.”

Use deterministic application logic for score calculation and policy. AI may assist with requirement extraction or interpretation, but its output must be validated and must not independently determine access, facts or score arithmetic.

## Checkpoint status rules

Use only: **Not started**, **In progress**, **Blocked**, **In review**, **Accepted**. Every checkpoint requires recorded evidence and review.

## Checkpoints

### M3-C01 — Matching rules and score specification

**Goal:** agree on the meaning, weights and limitations of a match score before implementing it.

**Work**

- Define requirement categories and weighting strategy.
- Define evidence states: Confirmed, Inferred, Missing and Can't verify.
- Apply provisional half-credit to inferred evidence only where the approved scoring rules allow it.
- Exclude “Can't verify” from the score rather than treating it as a negative.
- Define how absent profile information affects confidence and score explanation.
- Define stale-score invalidation when the job or Profile changes.

**Exit criteria**

- Scoring rules and worked examples are documented and approved.
- Score is explicitly described as a fit estimate, not hiring probability.
- Ambiguous evidence states have deterministic handling.

### M3-C02 — Job requirement extraction

**Goal:** produce structured, reviewable requirements from job descriptions.

**Work**

- Extract qualifications, experience, skills, responsibilities, location/work-mode constraints and other relevant requirements supported by the source text.
- Distinguish explicit requirements from preferred attributes.
- Preserve source evidence/snippets or references for explanations.
- Validate structured extraction and represent uncertainty.
- Handle missing, malformed or unusually short job descriptions.

**Exit criteria**

- Structured requirements are schema-validated and traceable to the source.
- Unsupported requirements are not invented.
- Extraction failure produces a safe unavailable/partial result rather than a fabricated analysis.

### M3-C03 — Evidence mapping to Profile and CV

**Goal:** map each requirement to available user evidence.

**Work**

- Use confirmed Profile fields and the current master CV from M2.
- Identify direct support, partial/inferred support, no supporting evidence and unverifiable requirements.
- Preserve references to the evidence used for each assessment.
- Avoid inferring a missing credential or experience from unrelated text.

**Exit criteria**

- Every assessed requirement has a documented evidence state and rationale.
- Evidence mapping is tested with positive, partial, absent and contradictory examples.
- Unconfirmed extraction does not become a confirmed user fact.

### M3-C04 — Deterministic fit scoring

**Goal:** calculate reproducible fit estimates from approved rules.

**Work**

- Implement the approved weighted calculation in application code.
- Keep score calculation independent of any AI provider.
- Produce component-level explanations and confidence/coverage information where useful.
- Handle zero applicable weight, missing inputs, rounding and incomplete profiles consistently.

**Exit criteria**

- Same inputs and rule version produce the same result.
- Unit tests cover weights, inferred evidence, unverifiable requirements and edge cases.
- Score cannot exceed defined bounds or be based on unvalidated AI arithmetic.

### M3-C05 — Explanation, uncertainty and freshness

**Goal:** make results understandable and prevent misleading stale scores.

**Work**

- Explain which requirements are supported, partially supported, unsupported by current evidence or unverifiable.
- Explain score limitations and distinguish missing evidence from lack of qualification.
- Record enough version/state information to determine when a score needs recalculation.
- Avoid presenting an estimate as a hiring prediction.

**Exit criteria**

- Explanations can be traced to job requirements and user evidence.
- Profile/job changes trigger refresh or clearly mark the result stale.
- Uncertainty is visible and handled consistently.

### M3-C06 — Job Discovery integration

**Goal:** add matching to the supplied Discovery design without making Discovery dependent on matching availability.

**Work**

- Display a match percentage only when a valid assessment exists.
- Provide access to the match-details panel or equivalent explanation.
- Handle missing Profile, missing CV, unavailable description and analysis failure.
- Keep search, filters, details, save and dismiss working when matching is unavailable.

**Exit criteria**

- Discovery never fabricates a score or blocks the feed waiting for matching.
- Score and detail explanations agree with the scoring service.
- Missing-profile and error states are tested.

### M3-C07 — Calibration, verification and acceptance

**Goal:** validate the behaviour across representative job and Profile scenarios.

**Work**

- Create representative fixtures covering strong, partial, weak, missing and unverifiable evidence.
- Test repeatability, scoring boundaries, stale-state handling and extraction failures.
- Review fairness risks, explainability, privacy and AI-provider failure behaviour.
- Record known limitations and examples.

**Acceptance criteria**

- Scoring is deterministic, explainable and tested.
- “Can't verify” is not treated as negative evidence.
- Match information integrates correctly with Discovery and can be reused by CV Studio.
- Evidence is recorded and the user explicitly accepts M3.
