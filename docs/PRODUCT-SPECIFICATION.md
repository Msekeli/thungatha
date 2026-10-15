# Thungatha — Product Specification

**Document status:** Working product authority for review  
**Version:** 1.0  
**Last updated:** 15 October 2026

## 1. Purpose

Thungatha is a job-search workspace that helps a person discover relevant opportunities, understand how their confirmed experience fits a role, prepare accurate CVs, and manage applications through to an outcome.

The product is one application with three primary experiences:

1. **Job Discovery** — find, inspect, save, and dismiss opportunities.
2. **CV Studio** — maintain a master CV and create reviewed, role-specific CV versions.
3. **Job Tracking** — record real applications and manage their lifecycle, history, and next actions.

Supporting areas are Profile and Account. Matching is a shared capability used by Job Discovery and CV Studio; it does not need to be a separate top-level destination in the initial navigation.

## 2. Product principles

- **One product:** one repository and one deployment, built as a modular monolith. The experiences are separate routes and focused workflows, not separate applications.
- **User control:** AI suggestions are proposals. Users review and accept changes; AI must not silently change confirmed profile data or the master CV.
- **Truth over persuasion:** never invent qualifications, experience, skills, achievements, dates, employers, or credentials.
- **Unknown remains unknown:** distinguish missing information from evidence that a user lacks a requirement.
- **Traceability:** job-fit explanations should link to evidence. Application records should preserve what was submitted and which CV version was used.
- **No false completion claims:** opening an employer's application page does not mean an application was submitted.
- **Privacy by default:** user-owned records are protected by server-side identity and ownership checks.
- **Resilience:** core discovery and record-management workflows should not depend on an AI provider being available.
- **Incremental delivery:** the six approved milestones are the delivery sequence. Do not expand or reorder them without explicit agreement.

## 3. Main experiences and routes

The three primary experiences must each be reachable directly by URL and must handle missing context gracefully. A user should not have to enter through another experience first.

| Experience | Route | Owns |
|---|---|---|
| Job Discovery | `/jobs` | Job catalogue, source information, search/filter, saved/dismissed state |
| CV Studio | `/cv-studio` | Master CV, tailored CV versions, review, preview, comparison, export |
| Job Tracking | `/job-tracking` | Application records, statuses, submitted materials, contacts, interviews, notes, follow-ups |
| Profile | `/profile` | Confirmed professional facts and profile history |
| Account | `/account` | Account-level settings and preferences, as defined in M6 |

Authentication pages remain `/sign-in` and `/sign-up`. The public landing page is `/`. Private data and user-specific actions require authentication.

The existing `/dashboard` route is legacy/current foundation code, not a new product requirement. Inspect its references and existing behaviour before deciding whether to retain, repurpose, redirect, or remove it. Do not expand it into a fourth primary experience.

## 4. Job Discovery

### Purpose

Help users find and organize real job opportunities, prioritizing roles in South Africa and remote roles that explicitly accept applicants located in South Africa.

### Required behaviour

- Present persisted listings from approved sources, with search, practical filters, and a useful detail view.
- Show the employer, role title, location/work mode where known, description, relevant dates, discovery source, and application destination.
- Preserve original source identifiers and links, and distinguish the site where a job was discovered from the site where the user applies.
- Support saving, dismissing, and undoing a dismissal where specified by the approved design.
- Persist per-user actions and enforce ownership.
- Represent unavailable, stale, incomplete, or unverified data honestly.
- Provide loading, empty, error, retry, and responsive states.
- Keep the feed usable when an AI provider is unavailable.
- Do not display a job as newly discovered merely because an ingestion run fetched the same listing again.

### Application boundary

Job Discovery is not the application lifecycle system. Finding, opening, saving, or dismissing a job does not create an application record. There is no manual job-entry feature in Job Discovery.

Users may record a job found elsewhere when they are recording an actual application in Job Tracking. External application submission remains on the employer or application destination site; Thungatha does not claim to submit applications automatically.

### Source approval

A source is not approved merely because it has a reachable endpoint. Before production use, record and verify its access method, terms, usage restrictions, quotas, freshness, attribution, credential requirements, and any approval required. Do not treat a research candidate list as an approved source list. Adzuna is excluded from the approved integration plan unless the user explicitly reopens that decision.

## 5. Profile

The Profile is the authoritative source for confirmed professional facts: work history, skills, education, qualifications, certifications, projects, and other agreed profile fields.

- Imported or AI-extracted information starts as a draft.
- The user reviews and confirms information before it becomes authoritative.
- Preserve relevant history/versioning so later CV tailoring and matching can explain which facts were used.
- Do not infer that a missing profile field means the user lacks that skill or qualification.
- Protect all profile reads and writes with server-derived identity and user ownership checks.

Profile and CV import are delivered in M2. The current profile implementation is foundation code to reuse and extend after inspecting it, not a reason to rebuild the foundation.

## 6. Matching and fit analysis

Matching is a shared capability used by Job Discovery and CV Studio. A separate top-level route is not required initially.

- Extract role requirements into structured, validated data.
- Map requirements to evidence in the user's confirmed Profile.
- Classify each requirement as **Confirmed**, **Inferred**, **Missing**, or **Can't verify**.
- Confirmed evidence receives full credit under the agreed scoring rules.
- Inferred evidence may receive half credit provisionally, with the uncertainty explained.
- Missing evidence is not the same as “Can't verify.”
- “Can't verify” is excluded from the score rather than treated as a negative.
- Explain how the score was produced and show supporting evidence.
- Present the result as an estimate of evidence-based fit, not a probability of being hired.
- Recalculate or mark the result stale when the job description or confirmed profile changes.

Final weights and thresholds must be specified and tested in M3 before being treated as fixed product rules.

## 7. CV Studio

### Inputs

Users can start from:
- a job selected from Job Discovery;
- a job URL; or
- pasted job-description text.

If a URL cannot be read safely or the page content is unavailable, ask the user to paste the job description. Do not pretend extraction succeeded.

### CV selection and tailoring

When a confirmed Profile/master CV exists, show it as the starting point. If no usable master CV exists, offer CV upload/import or guide the user to complete Profile.

AI may recommend one of three paths:
1. use the master CV as-is;
2. reuse an existing tailored CV version; or
3. create a new tailored CV version.

The user reviews the recommendation and can accept or reject it. Tailoring must use confirmed facts and may reorganize or clarify evidence, but must not fabricate experience, qualifications, dates, achievements, or skills.

### Version management

- Keep the master CV distinct from tailored versions.
- Never silently overwrite the master CV.
- Let users review edits and preview the result before saving.
- Save tailored versions with enough context to identify the target role and source input.
- Support comparing versions and exporting a chosen version.
- Preserve the exact version or a durable snapshot/reference of the material actually submitted when it is linked to an application.

## 8. Job Tracking

Job Tracking owns the complete lifecycle of real applications, whether the opportunity was found in Job Discovery or elsewhere.

A record is created when the user confirms they submitted an application or explicitly records an existing application. Merely viewing a job or clicking an external application link does not create an application.

### Required record and workflow

An application should capture, where available:
- company and role;
- original job/source URL and discovery source;
- application/submission date;
- current status and status history;
- CV version used and a durable snapshot/reference of submitted material;
- notes and key events;
- recruiter/contact details;
- interviews and related dates;
- rejection, offer, or other outcome;
- pending response and follow-up date/next action.

Support recording external applications manually within Job Tracking. This is different from manually creating catalogue jobs in Job Discovery.

### Quick recall

A user should be able to quickly answer:
- Where did this opportunity come from?
- What did I submit?
- What happened after I applied?
- What is the current status?
- What should I do next, and when?

Status transitions and history must be explicit and testable. Do not infer a positive outcome from silence or from opening a destination link.

## 9. Account and navigation

The landing page introduces the three main experiences and provides clear entry points. Private actions and personal data require sign-in.

After authentication, navigation should make Job Discovery, CV Studio, and Job Tracking the primary destinations. Profile and Account belong in a supporting group. The three main experiences must remain independently accessible by direct URL.

Account settings and preferences are delivered in M6. Do not invent account features beyond those agreed in the product requirements and M6 checkpoint document.

## 10. AI behaviour and provider strategy

AI is an assistive capability, not the authority for identity, access, persistence, or deterministic business rules.

Initial provider options recorded in project research:
- **Gemini API:** primary option for supported structured interpretation/extraction tasks.
- **Groq:** alternative provider for supported models/tasks and fallback experiments.
- **Camber:** optional experimentation; do not assume it is a drop-in inference API.
- **Ollama:** optional local experimentation, not a runtime requirement.

Keep provider-specific SDKs and keys behind server-side adapters. Validate structured output (using the project's established Zod conventions), set timeouts, and retry only bounded transient failures. Record useful failure metadata without logging secrets or unnecessary personal data.

Do not send CVs or other personal data to an AI provider unless the task, data sent, provider terms, and privacy/consent implications have been reviewed. Core non-AI paths must remain useful when AI is disabled.

## 11. Security, privacy, and data ownership

- Resolve identity on the server using the authenticated Clerk identity.
- Never trust a client-supplied user ID as proof of ownership.
- Validate untrusted request input at runtime.
- Enforce ownership for all user-owned reads and writes; use PostgreSQL Row Level Security where appropriate to the actual connection design.
- Keep secrets and privileged database credentials server-side.
- Treat external job content and AI responses as untrusted input.
- Do not log secrets, raw CVs, full job descriptions, or unnecessary personal data.
- CV files and generated documents must use durable object storage when file storage is implemented; do not rely on a serverless function's local filesystem.
- Test cross-user isolation, invalid input, failure states, and sensitive-data handling throughout delivery.

## 12. Quality and acceptance

Every milestone should include tests and verification appropriate to its changes. The final integrated product must pass, where available:
- formatting and linting;
- TypeScript checking;
- unit and component tests;
- API/integration and ownership tests;
- production build;
- Playwright end-to-end journeys;
- accessibility, responsive, security, and performance checks.

Record only commands actually run and results actually observed. A checkpoint is not accepted merely because code exists. Acceptance requires evidence, criteria review, and user approval under `IMPLEMENTATION-PLAN.md` and the relevant milestone specification.

## 13. Delivery sequence

The approved milestone order is fixed:

- **M0 — Foundation and authentication:** complete.
- **M1 — Job Discovery and Job Feed.**
- **M2 — Profile and CV Import.**
- **M3 — Job Matching and Fit Analysis.**
- **M4 — CV Studio.**
- **M5 — Job Tracking.**
- **M6 — Account, Integration and Release Readiness.**

The detailed checkpoints and their acceptance criteria live in the corresponding files under `milestones/`. This document defines product behaviour; `IMPLEMENTATION-PLAN.md` tracks cross-milestone sequence and status. Do not silently change the milestone sequence or scope.

## 14. Document authority

- `docs/PRODUCT-SPECIFICATION.md` — user-facing capabilities, product rules, and intended behaviour.
- `docs/ARCHITECTURE.md` — technical boundaries, runtime, integrations, repository map, and implementation conventions.
- `IMPLEMENTATION-PLAN.md` — cross-milestone plan, dependencies, status, and release-level progress.
- `milestones/<milestone-folder>/<milestone-file>.md` — detailed checkpoint execution and acceptance evidence.
- `DECISIONS.md` — rationale and recorded decisions, including decisions that remain open.
- `AGENTS.md` — instructions for AI coding agents working in the repository.
- `README.md` — setup, environment, commands, and quick-start information.

If a conflict is found, do not silently resolve it by guessing. Record the conflict and request review before changing an approved scope or decision.
