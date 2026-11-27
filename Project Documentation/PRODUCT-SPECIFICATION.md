# Thungatha — Product Specification

**Document status:** Working product authority for review  
**Version:** 1.0  
**Last updated:** 21 November 2026

## 1. Purpose

Thungatha is an AI-powered job-search and application-management platform. It helps people discover opportunities, understand job requirements, interpret how their confirmed experience and transferable skills relate to different roles, prepare accurate tailored CVs, and manage applications through to an outcome. AI is a core product capability used for contextual understanding and assistance; it is not limited to optional text extraction.

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
- **AI as a core capability:** use AI for tasks that require contextual language understanding, semantic interpretation, comparison, synthesis, and user-facing assistance. Do not replace these tasks with keyword-only or title-only rules merely to avoid AI integration.
- **Resilience:** core discovery and record-management workflows should remain usable when an AI provider is unavailable. AI-dependent capabilities must expose clear unavailable/retry states rather than fabricate deterministic substitutes.
- **Incremental delivery:** the six approved milestones are the delivery sequence. Do not expand or reorder them without explicit agreement.

## 3. Main experiences and routes

The three primary experiences must each be reachable directly by URL and must handle missing context gracefully. A user should not have to enter through another experience first.

| Experience    | Route           | Owns                                                                                        |
| ------------- | --------------- | ------------------------------------------------------------------------------------------- |
| Job Discovery | `/jobs`         | Job catalogue, source information, search/filter, saved/dismissed state                     |
| CV Studio     | `/cv-studio`    | Master CV, tailored CV versions, review, preview, comparison, export                        |
| Job Tracking  | `/job-tracking` | Application records, statuses, submitted materials, contacts, interviews, notes, follow-ups |
| Profile       | `/profile`      | Confirmed professional facts and profile history                                            |
| Account       | `/account`      | Account-level settings and preferences, as defined in M6                                    |

Authentication pages remain `/sign-in` and `/sign-up`. The public landing page is `/`. Private data and user-specific actions require authentication.

The existing `/dashboard` route is legacy/current foundation code, not a new product requirement. Inspect its references and existing behaviour before deciding whether to retain, repurpose, redirect, or remove it. Do not expand it into a fourth primary experience.

## 4. Job Discovery

### Purpose

Help users find and organize real job opportunities, prioritizing roles in South Africa and remote roles that explicitly accept applicants located in South Africa.

### Required behaviour

- Present persisted listings from approved sources, with search, practical filters, and a useful detail view.
- Show the employer, role title, location/work mode where known, description, relevant dates, discovery source, and application destination.
- Preserve original source identifiers and links, and distinguish the site where a job was discovered from the site where the user applies.
- Support saving, dismissing, and undoing a dismissal where specified by the approved design. Undo appears in a bottom snackbar for 10 seconds and then disappears.
- Persist per-user actions and enforce ownership.
- When a user opens an external application destination, record the visit timestamp; do not treat it as proof of submission.
- When a previously opened role is revisited and has no applied confirmation, ask “Did you apply for this role?” A “Yes, I applied” response persists an explicit job-linked applied marker; “No, not yet” dismisses only that occurrence of the prompt, which may appear again on a later visit.
- Do not show the prompt again after the user confirms they applied. Keep the applied marker separate from saved/dismissed discovery state.
- Represent unavailable, stale, incomplete, or unverified data honestly.
- Provide loading, empty, error, retry, and responsive states.
- Keep the feed usable when an AI provider is unavailable.
- Do not display a job as newly discovered merely because an ingestion run fetched the same listing again.

### Application boundary

Job Discovery is not the complete application lifecycle system. Finding, opening, saving, or dismissing a job does not create an application record. An external-link open is recorded only as a visit. If the user explicitly confirms that they applied, Discovery stores a minimal job-linked applied marker so the prompt does not keep returning; M5 Job Tracking remains responsible for the full application record, submitted materials, status history, contacts, outcomes, and follow-ups. There is no manual job-entry feature in Job Discovery.

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

## 6. Job understanding, matching and relevance

Matching is a shared AI-powered capability used by Job Discovery and CV Studio. It is not a separate top-level route.

AI is responsible for understanding the meaning of a job description and comparing that meaning with the user's confirmed professional evidence. This includes responsibilities, skills, technologies and tools, experience, qualifications, certifications, languages, transferable skills, and relevant domain context. The comparison must recognise equivalent work expressed through different job titles and terminology, including related work across industries.

Job titles and role-family labels are contextual signals only. They must never be hard gates or the deciding factor. Two roles with different titles may be a strong match when their actual responsibilities, required capabilities, and work are substantially aligned. Conversely, similar titles do not prove that the work is equivalent.

### Assessment approach

- Use AI to interpret the complete job description in context, understand the role's actual purpose and responsibilities, identify relevant capabilities and requirements, and semantically compare the work with confirmed Profile evidence. Do not restrict interpretation to predefined skill lists, regex patterns, title taxonomies, or fixed requirement templates.
- Preserve source evidence for every extracted job requirement, including the source description and supporting text snippet or reference.
- Ground candidate-side claims in confirmed Profile evidence and retain the exact Profile field/evidence references. Imported CV content remains a draft until the user confirms it.
- Distinguish evidence states as **Confirmed**, **Inferred**, **Missing**, or **Can't verify** where applicable. An inference must be labelled and explained; it must not be promoted to confirmed fact.
- Consider transferable skills and equivalent responsibilities even when wording, job title, seniority labels, or industry differ. Explain the basis and any limits of the comparison.
- Interpret qualifications, experience durations, credentials, subject marks, mandatory/preferred wording, and alternative pathways in the context of the full advert. No single phrase, field, threshold, or extracted requirement is an automatic rejection rule or universal gate.
- Missing Profile information is not evidence that the person lacks the requirement. Contradictory or ambiguous evidence must remain visible as uncertainty.
- Validate AI output against feature-owned schemas and verify all evidence references in application code. Treat model output as untrusted data, not as an instruction or authority.
- Application code validates evidence, authorization, persistence, freshness, sorting, and the two approved public classifications. It must not introduce rigid requirement checklists, keyword-triggered rejection, role-family gates, or a hidden score as a substitute for the AI's full-context assessment.
- Explain why an assessed role is a **Match** or **Relevant**, citing job-side and candidate-side evidence. Do not present a hiring prediction.

### Approved result labels

- **Match:** strong, supported alignment with the central work and genuinely core requirements, grounded in confirmed Profile evidence. A different job title or industry does not prevent this result when the underlying work and capabilities align. Interpret stated mandatory requirements in context; do not mechanically reject on one extracted phrase or missing field.
- **Relevant:** meaningful supported alignment exists, including transferable skills or related responsibilities, but material gaps, unknowns, or incomplete evidence prevent a strong Match conclusion.
- **Unavailable assessment (not a classification):** there is not enough trustworthy evidence to assess the role, the Profile is not confirmed, the job description is unusable, or the AI/provider response is unavailable or fails validation. Show no Match/Relevant badge and do not expose this state as a third relevance label.

**Match and Relevant are the only public matching classifications.** Do not create a third classification, intermediate labels, hidden ranking scores, numerical scores, percentages, weights, thresholds, weighted totals, score bands, fit points, or hiring-probability estimates. Do not persist, return, display, or sort by a numerical matching score.

### Sorting and freshness

- "Most relevant" orders assessed jobs by **Match**, then **Relevant**. Jobs without a valid assessment are not assigned a third category; keep them outside the classified ordering and use the agreed date-based fallback/tie-break behaviour.
- Newest and Oldest remain date sorts and do not depend on Profile availability.
- Candidate-specific results require a confirmed Profile. Without one, do not fabricate a personalised result; use the agreed newest-first fallback.
- Reassess or mark results stale when the job description, confirmed Profile, AI task/prompt/schema version, or applicable business rules change.
- If evidence is insufficient or AI analysis is unavailable or cannot be validated, represent the assessment as unavailable, without assigning a classification or badge, and keep the job feed usable. Do not silently fall back to title or keyword matching and present it as equivalent AI analysis.

### AI workload continuity

Reduce unnecessary AI work through reusable, versioned job understanding, valid assessment caching, compact task-specific inputs, and by avoiding duplicate requests. Do not impose arbitrary internal AI call, token, output-length, queue-depth, or per-request task budgets that truncate or abandon an otherwise valid assessment. If a provider's actual rate limit or temporary availability prevents completion, persist the task and its progress, defer/retry it safely, and resume without presenting partial output as a completed assessment. Respect provider terms and actual hard limits; do not silently incur paid usage or route work to a disabled provider. Keep model output complete enough to cover all material job content rather than dropping requirements to fit an arbitrary application-defined count.

## 7. CV Studio

### Inputs

Users can start from:

- a job selected from Job Discovery;
- a job URL; or
- pasted job-description text.

If a URL cannot be read safely or the page content is unavailable, ask the user to paste the job description. Do not pretend extraction succeeded.

### CV selection and tailoring

When a confirmed Profile/master CV exists, show it as the starting point. If no usable master CV exists, offer CV upload/import or guide the user to complete Profile.

AI actively supports the job-specific CV workflow. It should interpret the target role, identify the most relevant confirmed experience and transferable skills, recommend whether to use the master CV, reuse an existing tailored version, or create a new version, and propose role-appropriate ordering, emphasis, structure, and wording.

The user reviews each recommendation and proposed change and can accept, edit, or reject it. Tailoring must use confirmed facts and may reorganize or clarify evidence, but must not fabricate experience, qualifications, dates, achievements, or skills. Every factual addition must trace to confirmed Profile evidence. AI must not silently overwrite the master CV or confirmed Profile data.

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

## 10. AI product strategy and provider boundary

AI is a first-class product capability in Thungatha. It should materially improve the user's ability to understand opportunities, recognise relevant experience, and prepare accurate application materials. It is not merely a future enhancement or a thin extraction layer around otherwise keyword-driven features.

### Core AI responsibilities

- **Job Discovery and matching (M3):** understand complete job context semantically; identify responsibilities, skills, technologies, qualifications, experience and context; compare roles with confirmed Profile evidence; recognise equivalent work across different titles and industries; identify transferable skills; and produce evidence-grounded Match or Relevant explanations. When assessment cannot be supported, return an unavailable state rather than a third classification.
- **CV Studio (M4):** assist with role-specific CV recommendations, tailoring, restructuring, and wording using only confirmed facts. Users review proposed changes. AI must not fabricate or silently overwrite the master CV.
- **Profile and CV import (M2):** the current approved PDF-import checkpoint remains governed by its explicit local extraction and privacy constraints. AI-based interpretation of imported personal data is not automatically enabled by this product strategy; it requires a separately approved task, privacy review, and user-facing confirmation flow.
- **Other experiences:** add AI assistance only where an agreed user problem benefits from it. Do not invent autonomous actions or allow AI to submit applications, change application status, or make irreversible decisions.

### AI implementation principles

- Use AI for semantic understanding, contextual interpretation, comparison, synthesis, and generation where these capabilities materially outperform brittle keyword or title rules.
- Keep AI provider-neutral. Feature-owned use cases define their task prompts, input preparation, schemas, evidence requirements, and orchestration; shared infrastructure owns provider contracts, adapters, activation, routing, timeouts, and bounded retries.
- Validate structured output with the owning feature's Zod schema and validate evidence references against trusted application data. Schema validity alone does not prove factual correctness.
- Treat job descriptions, imported documents, user content, and model responses as untrusted data. External content must never override system or product instructions.
- Send only task-required information. Do not send raw CVs or unnecessary personal data to hosted providers without a task-specific privacy review and appropriate user notice/consent.
- Reuse valid prior results when the complete job context, confirmed Profile version, task/prompt/schema version, and applicable policy version have not changed. Do not make repeated AI calls without a reason.
- Use task-appropriate reasoning settings. Simple extraction or rewriting may use direct generation; semantic comparison must be allowed sufficient contextual interpretation and must be evaluated on representative cases. Do not globally disable model capabilities that a core product task requires.
- Keep discovery, authentication, authorization, persistence, validation, and application lifecycle operations functional when AI is unavailable. AI-dependent features must fail honestly and recover safely; do not silently downgrade them to keyword-only logic.

### Provider strategy

Follow D-048 for explicit environment-specific activation: Ollama Local is the only enabled provider in local development; Gemini Developer API and Groq API are the hosted providers, subject to their available free-tier access. Provider activation is explicit and server-side. Never activate a provider merely because credentials exist, expose credentials to the browser, or silently fall back to paid usage. Ollama Cloud is not part of the current provider plan.

Provider-specific SDKs and keys stay behind server-side adapters. Feature code must call the provider-neutral AI service and must not branch on provider names or environment names. Provider capabilities, context limits, response formats, and rate limits must be checked for the task. Preserve work when all enabled providers are unavailable and expose a clear failure state.

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

Record only commands actually run and results actually observed. A checkpoint is not accepted merely because code exists. Acceptance requires evidence, criteria review, and user approval under `../IMPLEMENTATION-PLAN.md` and the relevant milestone specification.

## 13. Delivery sequence

The approved milestone order is fixed:

- **M0 — Foundation and authentication:** complete.
- **M1 — Job Discovery and Job Feed.**
- **M2 — Profile and CV Import.**
- **M3 — Job Matching and Fit Analysis.**
- **M4 — CV Studio.**
- **M5 — Job Tracking.**
- **M6 — Account, Integration and Release Readiness.**

The detailed checkpoints and their acceptance criteria live in the corresponding files under `../milestones/`. This document defines product behaviour; `../IMPLEMENTATION-PLAN.md` tracks cross-milestone sequence and status. Do not silently change the milestone sequence or scope.

## 14. Document authority

- `PRODUCT-SPECIFICATION.md` — user-facing capabilities, product rules, and intended behaviour.
- `ARCHITECTURE.md` — technical boundaries, runtime, integrations, repository map, and implementation conventions.
- `../IMPLEMENTATION-PLAN.md` — cross-milestone plan, dependencies, status, and release-level progress.
- `../milestones/<milestone-folder>/<milestone-file>.md` — detailed checkpoint execution and acceptance evidence.
- `../DECISIONS.md` — rationale and recorded decisions, including decisions that remain open.
- `../AGENTS.md` — instructions for AI coding agents working in the repository.
- `../README.md` — setup, environment, commands, and quick-start information.

If a conflict is found, do not silently resolve it by guessing. Record the conflict and request review before changing an approved scope or decision.
