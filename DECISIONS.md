# Thungatha — Decision Log

This document records confirmed decisions, proposed directions, provisional choices, and unresolved questions. Its purpose is to prevent people and coding agents from silently turning assumptions into requirements.

## 1. Status labels

- **Confirmed** — explicitly agreed project direction.
- **Proposed** — recommended but not yet approved.
- **Provisional** — a working direction requiring validation before production reliance.
- **Open** — no final decision has been made.
- **Rejected** — considered and explicitly not selected.

When a decision changes, record the change and rationale. Do not erase meaningful decision history.

## 2. Confirmed product and engineering decisions

| ID | Decision | Rationale / constraints | Status |
|---|---|---|---|
| D-001 | One repository, one deployable Next.js application, modular monolith | Milestones are delivery boundaries, not separate services or applications. | Confirmed |
| D-002 | Next.js App Router, React, strict TypeScript, hosted on Vercel | Established application and hosting direction. | Confirmed |
| D-003 | Clerk is the authentication baseline | Resolve identity server-side; authentication alone does not enforce record ownership. | Confirmed |
| D-004 | Supabase PostgreSQL is the primary relational database | Schema changes must be repeatable and version-controlled. | Confirmed |
| D-005 | MUI for reusable components and Tailwind CSS v4 for layout and utilities | Component styling and CSS-layer integration must remain consistent. | Confirmed |
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
| D-024 | Exact supported versions of Next.js, React, MUI, Tailwind CSS v4, Clerk, Supabase, and related libraries | Check official compatibility guidance and the installed repository versions; lock compatible dependencies. | Open |
| D-025 | Exact Clerk–Supabase authorization and Row Level Security design | Verify the supported integration and token/connection model; test cross-user isolation. | Open |
| D-026 | CV/document storage, access, retention, export, deletion, and backup policy | Select compatible storage and define access-control and lifecycle requirements before production reliance. | Open |
| D-027 | Job refresh and scheduled-work execution | Validate source terms, idempotency, refresh requirements, quotas, and current Vercel/runtime limits. | Open |
| D-028 | Job matching score weights, badge thresholds, and visual bands | Approve a documented scoring rubric and representative test cases before production use. | Open |
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

The M1 specification is the detailed source of truth for these checkpoints and their evidence. `IMPLEMENTATION-PLAN.md` remains the cross-milestone summary.

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
