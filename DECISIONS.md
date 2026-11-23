# Thungatha — Decision Log

This document records confirmed decisions, proposed directions, provisional choices, and unresolved questions. Its purpose is to prevent people and coding agents from silently turning assumptions into requirements.

## 1. Status labels

- **Confirmed** — explicitly agreed project direction.
- **Proposed** — recommended but not yet approved.
- **Provisional** — a working direction requiring validation before production reliance.
- **Open** — no final decision has been made.
- **Rejected** — considered and explicitly not selected.
- **Superseded** — retained as history after a later decision replaced it.

When a decision changes, record the change and rationale. Do not erase meaningful decision history.

## 2. Confirmed product and engineering decisions

| ID | Decision | Rationale / constraints | Status |
|---|---|---|---|
| D-001 | One repository, one deployable Next.js application, modular monolith | Milestones are delivery boundaries, not separate services or applications. | Confirmed |
| D-002 | Next.js App Router, React, strict TypeScript, hosted on Vercel | Established application and hosting direction. | Confirmed |
| D-003 | Clerk is the authentication baseline | Resolve identity server-side; authentication alone does not enforce record ownership. | Confirmed |
| D-004 | Supabase PostgreSQL is the primary relational database | Schema changes must be repeatable and version-controlled. | Confirmed |
| D-005 | Earlier reusable-component and utility styling approach | Superseded by the shared-token and Tailwind CSS v4 direction in D-035 and D-040. | Superseded |
| D-006 | Docker is optional | Local development must not require a running Docker daemon as a universal prerequisite. | Confirmed |
| D-007 | Do not introduce an ORM by default | Use the existing Supabase JS client and SQL migrations unless a documented need justifies a change. | Confirmed |
| D-008 | The confirmed professional profile is the source of truth | Imported and AI-generated information remains a draft until reviewed and confirmed by the user. | Confirmed |
| D-009 | AI interprets; application code enforces deterministic rules | Authorization, ownership, validation, state transitions, calculations, and snapshot creation must not depend on AI discretion. | Confirmed |
| D-010 | Keep checkpoint history in `IMPLEMENTATION-PLAN.md` and detailed checkpoint evidence in the relevant milestone specification | Maintain cross-milestone visibility without creating a separate document for every small task. | Confirmed |
| D-011 | Deliver milestones in the agreed order: M0, M1, M2, M3, M4, M5, M6 | Job discovery precedes profile-dependent matching and CV tooling. M0 is complete; do not reopen it without specific evidence of a regression or an explicit decision. | Confirmed |
| D-012 | Job Discovery must work without AI | Source ingestion, persisted jobs, feed rendering, search, manual entry, and user actions must not depend on AI availability. | Confirmed |
| D-013 | Job discovery and application tracking are separate product responsibilities | Discovering, viewing, saving, or dismissing a job does not itself create an application record. Actual applications are managed in the application-tracking experience. | Confirmed |
| D-014 | Source identity and application destination must remain distinct | A discovery provider is not necessarily the employer or the official destination for applying. Verification claims require evidence. | Confirmed |
| D-015 | Preserve job and application history | Temporary provider failures must not erase stored jobs or falsely mark listings unavailable. Submitted application materials must be preserved as appropriate snapshots. | Confirmed |
| D-016 | AI must not invent professional facts or silently overwrite confirmed information | User review and deterministic validation remain authoritative. | Confirmed |

### D-035 — Tailwind CSS and shadcn/ui direction

- **Status:** Confirmed
- **Decision:** Use Tailwind CSS v4, shadcn/ui patterns, and existing Base UI/shared controls for the interface.
- **Rationale:** The user is redesigning the interface and selected Tailwind and shadcn/ui as the direction.
- **Constraints:** Preserve existing shared controls where suitable. Do not recreate components or add a dependency solely to imitate shadcn/ui.

### D-034 — UI icon library

- **Status:** Confirmed
- **Decision:** Use Lucide React (`lucide-react`) for general-purpose application UI icons.
- **Rationale:** Consistent, lightweight outline icons fit the Thungatha SaaS interface and support configurable size, stroke width, colour, and theme-aware styling.
- **Constraints:** Use icons consistently across navigation, job discovery, forms, and actions. Prefer CSS/Tailwind classes for theme-aware colours; avoid mixing icon libraries without a specific need. Keep the existing brand SVG assets separate from the UI icon system.
- **Implementation note:** The package installation and replacement of existing Unicode glyphs must be completed and verified on `dev`; this decision entry alone does not mean the dependency has been installed.

## 3. Job discovery and provider strategy
**M1-C03 implementation note:** Adzuna, Jooble and Greenhouse adapters have been implemented. Their presence in the provider registry does not imply production approval. Ongoing-use permission, attribution, quotas and operational suitability remain subject to source-specific validation.
The following direction is established by the M1 — Job Discovery & Job Feed specification. It must not be treated as an undecided overall strategy.

### D-017 — Source-agnostic job discovery

- **Status:** Confirmed
- **Decision:** Use a source-agnostic provider boundary so multiple permitted job sources can be integrated without coupling job-domain logic to a particular provider.
- **Rationale:** Different providers have different coverage, formats, access methods, restrictions, quotas, and reliability.
- **Constraints:** Normalize source data, preserve source identifiers and original links, deduplicate listings, handle retries safely, and retain meaningful availability history.
- **Review trigger:** A demonstrated architectural limitation that cannot reasonably be handled by the existing provider boundary.

### D-018 — Job-source priorities and geographic eligibility

- **Status:** Confirmed
- **Decision:** Prioritize South African job opportunities and remote positions that explicitly permit applicants located in South Africa. Employer career pages and public ATS listings are priorities, supplemented by suitable public feeds and aggregators where permitted.
- **Rationale:** Job discovery must return opportunities relevant to the intended users rather than assuming that every listing marked remote is globally available.
- **Constraints:** Do not infer South African eligibility from the word "remote" alone. Record unknown eligibility honestly.
- **Review trigger:** Evidence that source coverage or eligibility rules are excluding relevant opportunities or admitting unsuitable listings.

### D-019 — Candidate job-source inventory

- **Status:** Confirmed inventory; individual integrations require validation

The M1 specification identifies the following candidates:

| Source category | Listed candidates | Constraint |
|---|---|---|
| Employer career pages and public ATS endpoints | Greenhouse, Lever, Ashby, Teamtailor, Recruitee, Dayforce, and other employer-specific career pages | Validate the actual public endpoint, coverage, permitted access, and intended use. |
| Public remote-job feeds | Suitable feeds whose terms permit the intended use | Validate geographic eligibility, freshness, attribution, and redistribution or display restrictions. |
| Job aggregators | Adzuna, JSearch, Jooble, Careerjet | Validate access, licensing, quotas, costs, attribution, and approval requirements before integration. |

This inventory does **not** mean every listed provider is approved, integrated, or guaranteed to be suitable.

Adzuna is not approved for ongoing use until the required permission and licensing position is resolved.

The project has discussed a broad source-coverage goal. The candidate inventory alone does not constitute a verified list of ten approved providers.

### D-020 — Source approval and operational evidence

- **Status:** Confirmed
- **Decision:** A source may be treated as production-ready only after its intended access and use have been validated.
- **Required evidence, where applicable:**
  - Access method and configuration requirements.
  - Terms, licensing, attribution, and approval status.
  - Geographic and remote-work eligibility coverage.
  - Quotas, rate limits, costs, and freshness.
  - Data completeness and application-link quality.
  - Failure behaviour and operational limits.
- **Constraint:** Do not bypass authentication or access controls, or redistribute listings contrary to source terms.
- **Implementation checkpoint:** M1-C03 — First approved job source and ingestion adapter.
- **Review trigger:** Changes to source terms, quotas, pricing, access methods, or approval status.

### D-021 — Job-source expansion

- **Status:** Confirmed direction
- **Decision:** Establish a reliable initial integration and expand source coverage based on validated suitability and value.
- **Rationale:** Avoid integrating providers merely to increase a source count when their access, quality, or operating requirements are unsuitable.
- **Constraint:** Do not treat the first source as the permanent or exclusive source for the product.
- **Implementation checkpoints:** M1-C03 and M1-C04, followed by regression verification in M1-C09.

## 4. AI-provider strategy

### D-022 — Initial AI-provider options

- **Status:** Confirmed options; exact production configuration remains open
- **Decision:** Preserve the following options recorded in the M1 specification:
  - **Gemini API:** primary initial option for supported structured extraction and interpretation tasks.
  - **Groq:** alternative provider for supported models and tasks.
  - **Camber:** optional experimentation; not assumed to be a drop-in inference API.
  - **Ollama:** optional local experimentation; not a required runtime dependency.
- **Constraints:** Keep provider keys server-side, validate structured output, use bounded timeouts and retries, and handle unavailable providers safely.
- **Implementation checkpoint:** M1-C05 — AI boundary and optional job-content extraction.

### D-023 — AI task and production model selection

- **Status:** Open
- **Question:** Which exact AI task, model, and production configuration should be used?
- **What is needed:** Inspect actual source payloads, determine whether AI extraction adds measurable value, and compare quality, cost, privacy, availability, rate limits, and structured-output reliability.
- **Constraint:** Do not add an AI task merely because a provider is available. If deterministic processing is sufficient, document why AI extraction is unnecessary for M1.
- **Review trigger:** Source-format changes, observed quality problems, or material changes to provider cost and capability.

## 5. Open technical and operational decisions

| ID | Question | Required validation | Status |
|---|---|---|---|
| D-024 | Exact supported versions of Next.js, React, Tailwind CSS v4, Clerk, Supabase, and related libraries | Check official compatibility guidance and the installed repository versions; lock compatible dependencies. | Open |
| D-025 | Exact Clerk–Supabase authorization and Row Level Security design | Verify the supported integration and token/connection model; test cross-user isolation. | Open |
| D-026 | CV/document storage, access, retention, export, deletion, and backup policy | Select compatible storage and define access-control and lifecycle requirements before production reliance. | Open |
| D-027 | Job refresh and scheduled-work execution | Validate source terms, idempotency, refresh requirements, quotas, and current Vercel/runtime limits. | Open |
| D-029 | Evidence required to label an employer application destination as verified | Define verification rules, evidence requirements, and uncertain/failure states. | Open |
| D-030 | Whether to add an ORM, advanced table library, monitoring service, or background-work service | Demonstrate a concrete need and compare compatibility, cost, privacy, and operational burden. | Open |
| D-031 | Production operational thresholds, recovery procedures, and alerting | Define before release based on observed usage and failure impact. | Open |
| D-032 | Thungatha name, domain, and trademark clearance | Perform separate legal and availability checks. The working name does not imply clearance. | Open |
| D-033 | Exact verified provider list, including source-specific access and configuration details | Validate each candidate against D-020 and record evidence before classifying it as approved. | Open |

## 6. Milestone and checkpoint control

The agreed milestone sequence is:

1. **M0 — Product & Engineering Foundation:** complete.
2. **M1 — Job Discovery & Job Feed.**
3. **M2 — Professional Profile & CV Import.**
4. **M3 — Job Matching & Fit Analysis.**
5. **M4 — CV Studio.**
6. **M5 — Job Tracking / Application Management.**
7. **M6 — Account, hardening, and release.**

M1's nine checkpoints remain defined in the M1 specification:

- **M1-C01:** Repository audit and scope decisions.
- **M1-C02:** Job data model, ownership, and persistence.
- **M1-C03:** First approved job source and ingestion adapter.
- **M1-C04:** Normalization, deduplication, refresh, and source failure handling.
- **M1-C05:** AI boundary and optional job-content extraction.
- **M1-C06:** Job API and manual entry.
- **M1-C07:** Jobs feed, search, filters, and details.
- **M1-C08:** Save, dismiss, undo, and truthful source/application status.
- **M1-C09:** End-to-end verification, hardening, documentation, and acceptance.

The M1 specification is the detailed source of truth for these checkpoints and their evidence. Its decision not to add AI extraction applied only to M1's structured source payloads; it does not restrict the AI-powered semantic capabilities approved for M3 and CV assistance in M4. `IMPLEMENTATION-PLAN.md` remains the cross-milestone summary.

Do not mark a checkpoint accepted merely because implementation is complete. Record actual tests, observed results, remaining issues, and user review.

## 7. Decision-entry template

### D-XXX — Short decision title

- **Date:** YYYY-MM-DD
- **Status:** Proposed / Confirmed / Provisional / Open / Rejected
- **Context:** What prompted this decision?
- **Options considered:** List realistic alternatives.
- **Decision:** State the choice, or state that it remains open.
- **Rationale:** Explain the trade-offs.
- **Evidence/validation:** Link tests, official documentation, or measurements when available.
- **Consequences:** Implementation, security, cost, maintenance, or product impact.
- **Review trigger:** What would cause this decision to be reconsidered?

## 8. Change control

When a task depends on an Open or Provisional decision, identify the dependency before making an irreversible, expensive, or security-sensitive choice.

When a decision is approved or changed:

1. Record the decision and rationale here.
2. Update the relevant product, architecture, milestone, or implementation document.
3. Keep the documents consistent without erasing meaningful history.
4. Preserve the distinction between agreed direction, candidate options, validated evidence, and implemented behaviour.
5. Do not claim that a provider, feature, or checkpoint is approved or complete without supporting evidence.


### D-035 — Feature-based organization and incremental Job Discovery refactor

- **Date:** 2026-10-18
- **Status:** Confirmed
- **Context:** The public and authenticated Job Discovery experiences are separate large components. The project needs clearer feature ownership without destabilizing working routes, API contracts, or business behavior.
- **Options considered:** Reorganize the whole repository at once; merge public and authenticated discovery into one component; retain feature code under generic components/lib folders; introduce feature-based organization incrementally.
- **Decision:** Use `src/thungatha-features/<descriptive-feature-name>/` as the target home for feature-owned code. Keep Next.js routes and Route Handlers in `src/app/`, cross-feature UI in `src/components/`, and existing cross-cutting helpers/infrastructure in `src/lib/` unless a specific need justifies a move. Start with Job Discovery. Keep public and authenticated discovery as separate experiences, extracting only proven shared types, pure utilities, API callers, or UI components. Job Tracking remains authenticated; CV Studio may expose public introduction/preview while authoring remains authenticated.
- **Rationale:** This reduces feature coupling while avoiding speculative layers and a high-risk rewrite. The same job catalogue and API contracts can support both discovery experiences while user-specific actions remain protected.
- **Consequences:** Documentation records the target structure before source changes. Current implementation paths remain valid until a dedicated migration step moves them. Structural changes must preserve URLs, API response shapes, authentication/authorization, filters, state transitions, and UI behavior.
- **Verification:** Documentation and current paths were reviewed against the `dev` branch. No application source files are changed by this decision.
- **Review trigger:** Reconsider only if implementation evidence shows the feature boundary creates unnecessary duplication or conflicts with Next.js conventions.

### D-036 — Explicit feature folder names and URL-preserving route groups

- **Date:** 2026-10-18
- **Status:** Confirmed naming principle; route-group migration is pending
- **Context:** Generic feature folders such as `jobs`, `profile`, and `account` make code ownership harder to identify. Next.js App Router folder names also define URL segments unless a route group is used.
- **Decision:** Use explicit kebab-case names for feature-owned folders: `job-discovery`, `authentication`, `user-profile`, `user-account`, `cv-studio`, and `job-tracking`. Job listings are the catalogue/domain owned by Job Discovery, not a second top-level feature by default. Use descriptive Next.js route groups, for example `(job-discovery)`, `(user-profile)`, `(user-account)`, `(authentication)`, and `(job-listings)`, where useful to clarify the physical tree while preserving established URL paths. Keep API endpoint names stable unless an API migration is separately approved.
- **Rationale:** The filesystem should explain feature responsibility without forcing contributors to infer meaning from vague folder names or accidentally breaking URLs.
- **Consequences:** This is a naming and documentation decision, not a claim that all folders have already moved. Existing paths remain until each migration is inspected, implemented, and tested. Route groups must not create duplicate routes or alter public URLs.
- **Known discrepancy:** Product architecture specifies `/job-tracking`, while the current placeholder page is at `/applications`. Resolve that product/URL discrepancy separately; do not silently change it during folder migration.
- **Review trigger:** Reconsider a name only when a demonstrated product boundary or framework constraint requires it.

### D-037 — One shared Job Discovery implementation

- **Date:** 2026-10-20
- **Status:** Confirmed
- **Context:** Public and authenticated routes had separate discovery screens and duplicated state, feed, filtering, selection, and detail composition. The user requested reuse of the actual discovery implementation, with authentication handled at protected actions.
- **Decision:** Public `/` and authenticated `/jobs` use the same `JobsDiscovery` screen/controller and shared discovery UI. Keep route and layout composition thin. Gate save, dismiss, CV tailoring, and other user-owned actions at the action boundary; keep server-side authorization and user-owned data access unchanged. Application activity synchronization runs only for signed-in users.
- **Rationale:** One implementation prevents search, filters, results, pagination, and detail behavior from drifting while preserving public job exploration and protected user data.
- **Consequences:** Remove the separate public discovery implementation and its exclusive components/hooks when no longer referenced. Public and authenticated data may still differ where identity legitimately affects saved/dismissed state.
- **Verification:** Local TypeScript check and final ESLint run passed with no errors or warnings. Unit/E2E/build checks were blocked by the test dependency, sandbox port permission, and external font fetch respectively; see the M1-C07 record.
- **Review trigger:** Revisit only if product requirements establish a public-only discovery workflow that cannot be composed around the shared screen.


### D-038 — No AI extraction in M1 without a demonstrated content gap

- **Date:** 2026-10-24
- **Status:** Confirmed for M1
- **Context:** M1-C05 required a decision on whether provider content needs AI extraction.
- **Decision:** Do not add AI extraction to M1. Use deterministic validation and normalization for the structured provider responses currently supported. Reopen only if a permitted source demonstrates a concrete extraction gap and the scope is explicitly reviewed.
- **Rationale:** AI is not justified as an additional dependency where deterministic processing meets the current Discovery requirements.
- **Evidence/validation:** The M1 source-validation report documents structured provider payloads; M1 closeout records user acceptance on 2026-10-24.
- **Consequences:** M1-C05 is accepted as unnecessary for the current scope. This does not prevent a future, separately approved AI capability.
- **Review trigger:** A source-content audit identifies a concrete, tested need that deterministic extraction cannot satisfy.

### D-039 — M1 acceptance with explicit source limitations

- **Date:** 2026-10-24
- **Status:** Confirmed for M1 scope
- **Context:** M1 closure requires the source limitations to be visible and must not conflate technical connectivity with permission for ongoing production use.
- **Decision:** Accept and close M1 with the source limitations recorded in the M1 milestone document. Adzuna remains excluded from ongoing use unless explicitly reopened. Jooble and public employer ATS integrations remain subject to their documented terms, attribution, quotas, freshness, and destination-quality constraints.
- **Rationale:** The user has explicitly accepted M1 closure, while the repository must continue to distinguish implementation validation from legal/operational source approval.
- **Evidence/validation:** The user's M1 acceptance on 2026-10-24 and the source-validation report supplied to the project.
- **Consequences:** M1 is closed with limitations carried forward. This decision is not blanket approval for unrestricted use of every provider and does not reopen Adzuna.
- **Review trigger:** New source-specific approval evidence or an explicit user decision to reopen a provider.


### D-040 — Shared design tokens, component size, and controlled CSS introduction

- **Date:** 2026-10-24
- **Status:** Confirmed
- **Context:** Component-local visual values can cause theme drift and inconsistent interfaces. Milestone 2 must follow the same rules from its first change.
- **Decision:** Components must not define local colors, typography, font sizes/families, shadows, radii, borders, or competing palettes. Use existing semantic classes and shared theme tokens in `src/theme/tokens.json` and generated `src/styles/tokens.css`. Use Tailwind CSS v4 for layout and ordinary styling, and reuse existing shadcn/ui patterns and Base UI/shared controls. A handwritten component must remain at or below 100 physical lines; warn at 80 and refactor by cohesive responsibility. The same 100-line rule applies to other maintained handwritten source files. Before adding a CSS file or custom selector, explain why tokens, shared controls, and Tailwind are insufficient and obtain the user's agreement. CSS is allowed only when necessary and must remain minimal and scoped.
- **Rationale:** Centralized tokens preserve theme consistency; existing controls reduce duplication; concise components are easier to review and maintain; deliberate CSS introduction prevents competing styling systems.
- **Consequences:** Apply these rules to all new M2 work. Existing legacy violations should be recorded and addressed incrementally rather than triggering unrelated rewrites.
- **Review trigger:** Revisit only when a concrete UI requirement cannot be met through shared tokens, existing controls, or Tailwind CSS v4.


### D-041 — Optional target-role preference in Profile

- **Date:** 2026-10-24
- **Status:** Confirmed
- **Context:** Profile needs to capture the kind of role a user wants next without conflating profession with industry.
- **Decision:** Add one optional “What’s your next role?” text preference. Provide common role suggestions while allowing a custom job title. Do not add an Industry field. The preference is a relevance signal, not a hard filter.
- **Rationale:** The same profession can be used across many industries; the target title is a more direct signal for job discovery.
- **Consequences:** Persist the value in the profile and version snapshots. Job ranking integration remains part of matching/discovery follow-up and must not hide adjacent roles.
- **Review trigger:** User feedback or evidence that one target title is too restrictive.


### D-042 — PDF-only private CV import

- **Date:** 2026-11-19
- **Status:** Confirmed
- **Context:** Supporting PDF and DOCX in parallel was dividing effort while PDF extraction quality remained inadequate. CV documents also contain sensitive personal information.
- **Decision:** Support PDF only for CV upload and extraction until the PDF checkpoint is reviewed and accepted. Use the existing local/server-side `pdf-parse` NPM package. Do not send CV documents or extracted personal data to external parsing APIs. DOCX, OCR and AI extraction are out of scope for this checkpoint.
- **Fallback:** Manual Profile creation and editing remain available. Extraction may be partial; users can correct or complete missing information. Extraction failure must not block Profile creation.
- **Rationale:** Focus implementation and acceptance on one document format, retain control of sensitive CV data, and avoid a paid external dependency.
- **Consequences:** Remove DOCX from the UI, upload and extraction APIs, and dependency manifest. Restrict the existing private Storage bucket through a forward migration; do not rewrite the historical migration or delete existing staged objects automatically.
- **Acceptance evidence:** Test representative anonymised linear and multi-column PDFs. Do not commit user-provided CV files.
- **Review trigger:** PDF extraction has passed user review and acceptance; only then may another format be considered separately.


### D-043 — Initial deterministic M3 matching proposal and on-read candidate derivation

- **Date:** 2026-11-20
- **Status:** Superseded by D-050 for matching semantics; candidate derivation and data-integrity constraints retained
- **Context:** M3 requires explainable matching across job descriptions and confirmed candidate Profiles. The initial design considered AI-assisted extraction, fuzzy matching, and a persisted candidate-facts snapshot.
- **Decision:**
  - Historical proposal only: the initial M3 design kept extraction and comparison deterministic and rules-only. D-050 supersedes this restriction and approves AI-assisted semantic job understanding and candidate-to-role comparison. Candidate fact derivation, evidence validation, and application-owned invariants remain deterministic.
  - Historical deterministic baseline: text normalisation and exact canonical identifier lookup through a reviewed alias dictionary may provide direct evidence. Under D-050, these aliases supplement rather than replace semantic AI comparison. Preserve punctuation distinctions in technical identifiers such as C#, C++, .NET, and Node.js.
  - Keep Fuse.js out of M3. It may be considered separately for future Job Discovery search or autocomplete, with its own evaluation.
  - Derive candidate facts from the complete confirmed Profile through a pure function at read time. Do not create a separate candidate_facts table in the initial implementation; revisit only if measured derivation cost justifies persistence.
  - Treat unparseable or incomplete employment dates as unknown; never guess or count them as zero. Merge overlapping employment periods to avoid double-counting.
  - Keep academic qualifications distinct from certifications, professional registrations, and licences. NQF classification applies to qualifications; do not assign NQF levels to certifications or licences without an independently registered qualification basis.
  - For the planned catalogue ceiling of 5,000 jobs, retrieve the full filtered set in bounded database pages, perform the approved AI-assisted assessment using structured job metadata and confirmed candidate evidence, order the complete filtered set by categorical outcome, and then apply user-facing pagination. Do not rank only the currently requested page. Reassess SQL-side ranking or background processing only if measured performance at the agreed ceiling requires it.
  - Unknown or unclassified job requirements and role families must remain unknown; do not hard-filter on uncertain evidence.
- **Historical rationale:** The initial proposal favoured exact deterministic matching for auditability. D-050 establishes that semantic AI comparison, constrained by source evidence and application-side validation, is the approved approach. On-read candidate fact derivation remains useful for avoiding stale candidate-fact snapshots while calculation remains inexpensive. Deferring SQL ranking and background processing keeps the first implementation proportional to the current catalogue.
- **Evidence/validation:** User-confirmed direction in the M3 design discussion on 2026-11-20. The detailed business rules, qualification mappings, vocabulary coverage, and performance assumptions still require C01 decisions and M3-C07 validation.
- **Consequences:** The original M3 milestone document recorded a rules-only scope. That scope is superseded by D-050, which defines the current semantic AI matching direction and categorical labels. Candidate fact derivation and evidence integrity constraints remain applicable.
- **Review trigger:** Measured performance problems, demonstrated extraction false positives/false negatives, a material change in catalogue scale, or an explicit user decision to revise the M3 boundary.


### D-044 — Structured education, subject-mark, and professional certification requirements

- **Date:** 2026-11-20
- **Status:** Superseded by D-051 for matching interpretation; evidence-type distinctions retained
- **Context:** Job adverts may require Matric/Grade 12 and also specify minimum marks in Mathematics or another subject. Other adverts offer alternative pathways such as a diploma, degree, equivalent experience, or named professional/vendor certifications.
- **Decision:**
  - Model Matric, Grade 12, and National Senior Certificate (NSC) as potential aliases for a school-leaving qualification when context supports it, while preserving the original advert wording.
  - Represent subject-specific minimum marks as separate requirements linked to the school qualification. Satisfying Grade 12 alone does not satisfy a separate subject/percentage threshold.
  - Do not assume Mathematical Literacy is equivalent to Mathematics. Do not convert grades or symbols to percentages without an approved, verified conversion rule.
  - Represent requirements with explicit AND/OR structure. For example, a school qualification plus a minimum Mathematics mark is an AND; “relevant diploma or degree, or equivalent experience” contains alternative pathways.
  - Keep academic qualifications separate from vendor/professional certifications, registrations, and licences. AWS and Microsoft Azure certifications can satisfy a specifically named certification requirement. They may replace an academic qualification only where the advert explicitly permits that alternative or a separately approved equivalence rule supports it; otherwise they are additional evidence of technical capability.
- **Rationale:** Flat qualification strings would lose strict subject thresholds and alternative pathways, causing false-positive matches. Credential categories must remain distinct to avoid treating a vendor certification as an academic award.
- **Evidence/validation:** User clarification during M3 design review on 2026-11-20. Detailed extraction patterns, result-format handling, and equivalence rules remain subject to C01 review and C07 calibration.
- **Consequences (historical):** The original proposal treated subject marks and qualification pathways as separately modelled conditions. D-051 supersedes any interpretation of these conditions as rigid matching gates. Preserve the source details and credential distinctions, but let AI interpret their significance in the complete advert and confirmed Profile context; no single condition automatically rejects a job.
- **Review trigger:** Calibration reveals systematic parsing errors or an explicit change to the agreed qualification equivalence policy.


### D-045 — Initial categorical relevance labels and catalogue-wide Discovery sorting (superseded by D-050)

- **Date:** 2026-11-20
- **Status:** Confirmed
- **Context:** M3 initially proposed fit tiers and numerical scoring. The user rejected scores and percentages and confirmed that matching must drive the existing Job Discovery "Most relevant" sort.
- **Decision:**
  - Do not calculate, persist, return, or display numerical fit scores, percentages, weighted totals, or hiring-probability estimates.
  - Historical labels were **Relevant**, **Partially relevant**, and **Unclassified**. D-050 replaces them with **Match**, **Relevant**, and **Unclassified**.
  - The current Match category requires strong evidence of alignment with central work and core/mandatory requirements.
  - The current Relevant category requires meaningful supported alignment, while material gaps or unknowns prevent Match.
  - Unclassified applies when evidence is insufficient, ambiguous, unsupported, or materially contradictory. Show no badge for this state.
  - D-050 defines the current visual treatment and sorting order. Do not retain Partially relevant as a current product label.
  - "Most relevant" now sorts the full filtered catalogue by Match, Relevant, then Unclassified. Sort ties by newest publication date and existing stable tie-breakers. "Newest" and "Oldest" remain date-based.
  - Relevance ordering must happen before pagination across the full filtered catalogue. Page-only ranking is not acceptable.
  - Candidate-specific relevance requires a confirmed Profile. Without one, do not fabricate relevance; "Most relevant" falls back to newest-first.
- **Rationale:** Clear categorical labels avoid false precision and make the Discovery sort meaningful. Separating partial evidence from insufficient evidence prevents uncertainty from being misrepresented as relevance.
- **Evidence/validation:** User-approved M3 direction on 2026-11-20.
- **Consequences:** D-050 now defines the current labels, semantic AI responsibilities, and evidence-grounding requirements. Existing relevance sort API option must be connected to real catalogue-wide ordering.
- **Review trigger:** Calibration shows that category boundaries create systematic false positives/negatives or catalogue growth requires a different ranking strategy.


### D-046 — Validate Profile confirmation against merged saved data

- **Date:** 2026-11-20
- **Status:** Confirmed implementation direction
- **Context:** The Profile PATCH endpoint previously validated a non-null confirmation timestamp against only the incoming partial payload. This could reject valid partial confirmations or accept an incomplete Profile if validation rules changed.
- **Decision:** Validate confirmation using the complete saved Profile merged with the incoming PATCH fields. If a PATCH omits `confirmedAt`, clear the existing confirmation; callers must explicitly reconfirm after a partial update.
- **Rationale:** M3 must derive candidate facts only from a complete, explicitly confirmed Profile. A stale confirmation must not survive an edit that did not explicitly reconfirm the Profile.
- **Consequences:** The Profile API contract documents the merged validation and invalidation behaviour. The existing full-profile save flow already sends a timestamp for complete Profiles and null for incomplete ones.
- **Validation:** Added integration tests for merged confirmation success and incomplete merged Profile rejection. Tests have not been run.
- **Review trigger:** A future explicit draft-edit workflow or confirmation UX change that establishes a different, equally safe confirmation lifecycle.

### D-047 — Provider-independent, free-tier AI foundation

- **Date:** 2026-11-20
- **Status:** Superseded by D-048 (historical decision retained)
- **Context:** Thungatha is an AI-powered job-search platform, but predictable application operations should remain ordinary application logic. AI should be introduced where interpretation, extraction, reasoning, or generated assistance provides measurable value. The project is intentionally using free AI offerings.
- **Decision:** Put shared AI infrastructure under `src/lib/ai/`. Use a provider-neutral contract with separate adapters for the existing Ollama Local installation, Gemini Developer API, Groq API, and Ollama Cloud. Ollama Local is the default for local development. Cloud providers may be used only within their currently available free API allowances; no automatic paid fallback is permitted. Provider/model quotas must be represented according to their actual reset and rate-limit policies rather than assuming a monthly reset.
- **Feature boundary:** Task-specific prompts, schemas, input preparation, and use-case orchestration stay in the owning feature. Validate every structured response with Zod. AI output is untrusted and cannot silently modify confirmed Profile data or decide application-owned business rules.
- **Matching boundary (historical; superseded by D-050):** AI-assisted extraction was permitted, but semantic comparison and final classification were reserved for deterministic application logic. D-050 now explicitly approves AI-assisted semantic interpretation and candidate-to-job evidence comparison, with application-side validation and categorical outcome enforcement.
- **Privacy:** Minimise data sent to cloud providers. Do not send raw CVs or unnecessary personal data to free-tier providers without a task-specific privacy review.
- **Consequences:** Provider adapters, quota-aware routing, task schemas, and feature integrations will be implemented incrementally and tested independently. Local development must remain possible without cloud credentials.
- **Review trigger:** Free-tier policy changes, a provider's free API access being withdrawn, a new provider being proposed, or evaluation showing that AI does not improve a task enough to justify its complexity.

### D-048 — Environment-specific AI provider activation

- **Date:** 2026-11-20
- **Status:** Confirmed
- **Context:** Thungatha needs provider-independent AI infrastructure, but enabling multiple providers during local development adds unnecessary configuration and risks consuming hosted-provider allowances before production. The application must be able to use hosted providers later without feature-code changes.
- **Decision:**
  - During local development, Ollama Local is the only enabled AI provider. Gemini and Groq may be represented in local configuration, including optional credentials, but they must remain disabled and must not receive requests.
  - In the hosted production environment, Gemini Developer API and Groq API are the enabled hosted providers, subject to their available free-tier access. Their credentials and activation settings belong in the hosted environment configuration, not in client-side code.
  - Provider activation must be explicit through server-side environment/configuration. Do not infer provider availability merely from the presence of an API key, and do not silently activate a provider.
  - Feature code must call the provider-independent AI service and must not branch on environment names or provider identities. Switching from local development to hosted production must require configuration, not feature-code changes.
  - The provider router may select or fall back only among providers enabled for that environment and permitted by the specific task's capability, privacy, and fallback policy. It must not send requests to disabled providers.
  - Ollama Cloud is not part of the current provider plan.
- **AI efficiency:** Call AI only when a task genuinely benefits from interpretation, extraction, reasoning, or generation. Prefer deterministic application logic for predictable operations; reuse valid prior results; avoid repeating calls when the relevant input has not changed; and send only task-required data.
- **Operational visibility:** Do not build a separate usage-monitoring or internal quota-budget subsystem for the MVP. Retain only the diagnostics needed to troubleshoot provider calls, such as provider identity internally, success/failure, latency, token usage when returned, and rate-limit/retry information. These diagnostics must not impose arbitrary internal usage caps or stop otherwise valid work. Respect actual provider limits and preserve work when all enabled providers are temporarily unavailable.
- **Rationale:** Local development remains predictable and independent of hosted API quotas, while production providers are already catered for behind the same provider-neutral boundary. Selective AI use reduces unnecessary calls more effectively than monitoring consumption after the fact.
- **Consequences:** Update the architecture and AI infrastructure guidance to reflect the environment policy. Provider activation, hosted credentials, and task-aware routing must be implemented and tested before hosted AI features are enabled.
- **Review trigger:** A change to the selected providers, free-tier availability, hosting environment, or evidence that another provider is needed.


### D-049 — Source-grounded AI output and task-appropriate reasoning

- **Date:** 2026-11-20
- **Status:** Confirmed
- **Context:** Thungatha uses AI to work with information already supplied by the user or present in a job source. Unnecessary model reasoning increases latency and can encourage unsupported elaboration. CV assistance may improve presentation, but must preserve the truth of the source material.
- **Decision (updated by D-050 for semantic matching tasks):**
  - Treat AI as a source-grounded interpretation, semantic comparison, extraction, organisation, summarisation, and wording assistant, not an independent source of facts.
  - Factual claims in AI output must be supported by the task's supplied evidence. AI may improve wording and structure but must not invent qualifications, credentials, employers, job titles, dates, responsibilities, skills, achievements, or other personal/job facts.
  - Preserve missing or unverifiable information as unknown. Do not fill gaps with plausible assumptions. Where a task requires information that is absent, leave it out or identify the gap.
  - Use task-appropriate model capabilities. Direct generation remains suitable for simple extraction and wording tasks. Context-heavy semantic comparison may use provider-supported reasoning when representative evaluation demonstrates a need. Do not globally disable a capability required by an approved core task. The Ollama Local adapter must expose task-level control rather than hard-code `think: false` for every request.
  - Reasoning settings are not a factuality guarantee. Each feature remains responsible for source-limited prompts, minimal inputs, strict output schemas, and application-side evidence validation. AI output remains untrusted and must not silently modify confirmed Profile or master CV data.
- **Rationale:** Thungatha should accurately interpret available information rather than create plausible but unsupported content. Task-appropriate settings avoid unnecessary latency for simple tasks while preserving the contextual capability required by semantic comparison.
- **Consequences:** The Ollama Local adapter must support task-specific reasoning configuration. Feature-specific AI integrations must preserve source evidence and explicitly handle missing information. Provider-specific reasoning controls for Gemini and Groq must be evaluated when those adapters are implemented; this decision does not assume their APIs use Ollama's setting.
- **Review trigger:** Representative evaluation shows that task-specific model capabilities are insufficient, provider reasoning controls change, or the source-grounding and evidence-validation requirements need revision.

### D-051 — Contextual interpretation without restrictive matching gates

- **Date:** 2026-11-21
- **Status:** Confirmed
- **Context:** The existing M3 prototype uses regex extraction, a fixed skill list, title/role-family inference, exact matching, and rigid requirement handling. These rules can misinterpret job descriptions, exclude transferable experience, and distort categorical relevance when a single extracted field is treated as decisive.
- **Decision:**
  - AI must interpret the complete job description and compare the actual work with confirmed Profile evidence. No fixed skill dictionary, regex pattern set, exact-string evaluator, title taxonomy, or role-family vocabulary may act as the semantic decision engine.
  - Qualifications, experience durations, certifications, licences, school marks, mandatory/preferred wording, and alternative pathways must be interpreted in the full advert and candidate context. No single extracted requirement or phrase is an automatic rejection gate.
  - Preserve meaningful distinctions between evidence types, but do not impose universal equivalence or substitution rules. Explain direct evidence, transferable relevance, material gaps, contradictions, and uncertainty.
  - Missing Profile information is not proof of inability or failure. It means the capability is not demonstrated in the available confirmed evidence.
  - Retain deterministic application safeguards: schema and evidence-reference validation, identity, authorization, ownership, persistence, freshness, idempotency, sorting, and state transitions.
  - Legacy regexes, aliases, role-family data, and fixed mappings may remain only for narrow syntax validation, display normalization, or migration compatibility where they cannot influence semantic interpretation or the final category.
- **Rationale:** The product must assess the substance of work rather than mechanically reward familiar wording or reject candidates because their experience is described differently.
- **Consequences:** Update the product specification, architecture, M3 milestone, implementation plan, AI guidance, and agent instructions. Retire the legacy semantic gates as part of M3 implementation; do not delete unrelated validation, source normalization, user-selected discovery filters, or security safeguards.
- **Review trigger:** Representative evaluation shows material false positives/negatives or the user explicitly changes the approved interpretation approach.

### D-052 — Two public matching classifications and completion-safe AI workload

- **Date:** 2026-11-23
- **Status:** Confirmed
- **Context:** The earlier M3 documentation exposed Unclassified as a third relevance outcome. The user has clarified that the public product should show only Match and Relevant. The user also rejected arbitrary internal AI usage limits because a task can be cut off or prevented from completing when a budget is reached.
- **Decision:**
  - The only public matching classifications are **Match** and **Relevant**. Match means strong, evidence-supported alignment with the central work and core requirements. Relevant means meaningful supported alignment exists, while material gaps or unknowns prevent Match.
  - Insufficient evidence, an unconfirmed Profile, unusable job content, provider unavailability, or invalid model output is an **unavailable assessment state**, not a third classification. It receives no Match/Relevant badge and is not presented as a relevance category.
  - "Most relevant" orders successfully assessed jobs by Match and then Relevant. Jobs with unavailable assessments receive no inferred relevance ranking; the agreed date-based fallback remains available. No numerical score or hidden ranking is introduced.
  - Do not impose arbitrary internal AI call, token, output-length, per-job budget, queue-depth, or task-count caps that truncate, reject, or abandon otherwise valid matching work. Do not deliberately shorten a semantic assessment by dropping material requirements to fit an application-defined output count.
  - Reduce unnecessary AI consumption through context-aware caching, deduplication of in-flight requests, compact task-specific evidence, and reuse of valid completed results. Reuse is allowed only while all relevant job context, Profile, prompt/schema, parser, and policy versions remain current.
  - Respect actual provider rate limits, terms, and enabled-provider configuration. When a provider limit or outage prevents completion, persist the task and its progress, defer/retry safely, and resume it. Never silently route to a disabled provider, incur unapproved paid usage, or present partial output as a completed assessment.
  - Keep bounded retry handling only as protection against endless retry loops; exhausted transient retries must leave recoverable task state and a clear unavailable/retry path, not silently discard the work.
- **Rationale:** The product needs complete, trustworthy assessments. Efficiency should come from avoiding duplicate work, not from arbitrary budgets that can interrupt a valid job.
- **Consequences:** Update the product specification, architecture, implementation plan, M3 milestone, and agent instructions. Existing Unclassified category references are historical implementation details and are superseded for public behaviour. Existing queue/backfill admission caps must be reviewed and removed or redesigned so they cannot reject or abandon valid M3 work. Cache identity must include complete matching context, not description text alone.
- **Review trigger:** Representative evaluation shows the two public classifications are insufficient, provider terms change, or the user explicitly revises this policy.

### D-050 — Semantic, evidence-grounded AI job matching without scores

- **Date:** 2026-11-21
- **Status:** Confirmed for semantic matching and no-score principles; public outcome count superseded by D-052
- **Context:** Thungatha is an AI-powered job-search platform. Earlier M3 documents restricted matching to deterministic extraction, exact keyword matching, and role-family rules. That restriction undermined the product's core AI purpose and could misclassify equivalent work simply because job titles or wording differ. The user has explicitly directed that AI be used meaningfully in the application and that all numerical scoring language be removed.
- **Decision:**
  - AI is responsible for understanding job descriptions in context and semantically comparing the actual work and requirements with the user's confirmed Profile evidence. It should interpret responsibilities, skills, technologies/tools, experience, qualifications, certifications, languages, transferable skills, and relevant domain context.
  - Different job titles may describe substantially equivalent work. Titles, seniority labels, industry names, and role-family labels are contextual signals only; they are never hard gates or the deciding factor. Similar titles alone do not establish a match.
  - AI may extract and interpret source requirements, identify related capabilities and transferable skills, compare evidence across different wording, and produce a structured assessment with source references and an explanation.
  - Job-side claims must reference the source job description and supporting text snippet/offset. Candidate-side claims must reference confirmed Profile evidence. Imported CV information remains unconfirmed until reviewed and confirmed by the user.
  - AI must not invent facts, promote inferred or imported claims to confirmed evidence, or treat missing Profile information as proof of absence. Preserve **Confirmed**, **Inferred**, **Missing**, and **Can't verify** evidence states.
  - Application code validates the AI response schema, verifies every source and Profile evidence reference, enforces authorization and privacy, applies the approved categorical business rules, and owns persistence, freshness, sorting, and state transitions. Deterministic validation is a guardrail; it must not replace semantic AI comparison with keyword-only logic.
  - The only overall relevance labels are **Match**, **Relevant**, and **Unclassified**. **Match** means strong supported alignment with the central work and core/mandatory requirements. **Relevant** means meaningful supported alignment exists but material gaps or unknowns prevent Match. **Unclassified** means evidence is insufficient, ambiguous, unsupported, or contradictory. Only Match and Relevant receive badges.
  - "Most relevant" sorts the full filtered catalogue by Match, then Relevant, then Unclassified. Date sorts remain independent.
  - No numerical score of any kind is allowed: no percentages, weights, thresholds, weighted totals, fit points, score bands, hidden numeric rankings, hiring probabilities, or numerical badge values. Do not calculate, persist, return, display, or sort by a numerical score.
  - AI-dependent functionality must report unavailable/uncertain states honestly when providers fail or output cannot be validated. Do not silently replace it with title or keyword matching and present that as equivalent. The core feed and ordinary record-management workflows must remain usable.
  - AI provider usage follows D-048. Task-specific model capabilities and reasoning settings must be evaluated for semantic comparison; D-049's global no-thinking default is superseded for tasks that require contextual interpretation.
- **Rationale:** Semantic AI can understand equivalent responsibilities and transferable skills beyond literal title or keyword overlap. Evidence references and application-side validation preserve trust without reducing the product to a deterministic rules engine.
- **Consequences:** Product specification, architecture, README, agent instructions, implementation plan, and M3 checkpoints must align with this decision. D-043's rules-only matching restriction and D-047's deterministic comparison boundary are superseded. D-045's Partially relevant label and related display/sorting rules are superseded. M3 must implement and evaluate AI-assisted semantic comparison before claiming the intended AI-powered matching capability is complete.
- **Review trigger:** Representative evaluation shows unacceptable false positives/negatives, privacy/provider constraints change, or the user explicitly revises the approved matching approach.
