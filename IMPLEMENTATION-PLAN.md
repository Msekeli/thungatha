# Thungatha — Master Implementation Plan

**Document status:** Draft for review  
**Purpose:** Master roadmap, milestone scope, dependencies, progress and acceptance tracking  
**Product:** Thungatha  
**Architecture:** Next.js modular monolith  
**Milestones:** M0–M6

---

## 1. Purpose of This Document

This document defines the implementation roadmap for Thungatha, from the completed application foundation through the integrated, production-ready product.

It is the authoritative source for:

- Overall milestone sequence and scope.
- Milestone dependencies and progress.
- High-level outcomes and completion criteria.
- Cross-milestone risks, decisions and blockers.
- Final product acceptance and release readiness.

Detailed checkpoint definitions, implementation tasks, test plans, evidence and checkpoint-level acceptance criteria belong in the corresponding milestone documents.

**Change control:** The agreed milestone sequence and scope must not be changed casually. If a genuine technical constraint requires a change, document the reason and obtain approval before changing the roadmap.

## 2. Product Overview

Thungatha helps job seekers discover relevant opportunities, understand how their experience fits those opportunities, prepare appropriate CVs, and manage their applications through to their outcomes.

The product is organised around three primary experiences:

1. **Job Discovery** — find, inspect, search, filter, save and dismiss job opportunities.
2. **CV Studio** — manage a master CV, assess existing CV versions and create tailored versions for specific opportunities.
3. **Job Tracking** — record applications, preserve submitted materials, track progress and outcomes, and manage follow-ups.

Supporting capabilities include Profile, Matching and Account.

The application will initially remain one Next.js application with a modular architecture, shared authentication and shared data infrastructure. The primary experiences must be accessible directly through their own routes without requiring the user to navigate through another experience first.

The product specification and architecture document will define these experiences and their technical boundaries in detail.

## 3. Overall Project Status

| Milestone | Name | Status |
|---|---|---|
| M0 | Foundation and Authentication | **Accepted — complete** |
| M1 | Job Discovery and Job Feed | In progress — C01 in review |
| M2 | Profile and CV Import | Not started |
| M3 | Job Matching and Fit Analysis | Not started |
| M4 | CV Studio | Not started |
| M5 | Job Tracking | Not started |
| M6 | Account, Integration and Release Readiness | Not started |

### M0 — Official completion record

**Status: Accepted — complete.**

The user has confirmed that the foundation is fully working and complete. M0 is closed and must not be reopened because an older document contains an outdated status.

The existing authentication and database foundation, including Clerk and Supabase, is the starting point for subsequent milestones. Future work must preserve the working foundation and avoid unnecessary rewrites.

M0 completion does not automatically mean that later milestones, the integrated product or production release have been accepted.

### Current focus

M1 is the current implementation milestone. C04's database-side ingestion reliability work has been verified within the recorded scope. C05 is under investigation; its AI-extraction decision and implementation scope remain unresolved. Work may proceed to C06's Discovery query and action contracts while C05 remains explicitly open, provided C06 does not assume or depend on AI extraction.

No future milestone or checkpoint may be marked complete without the required verification evidence and review.

## 4. Milestone Roadmap

### M0 — Foundation and Authentication

**Status: Accepted — complete**

**Outcome:** A functioning application foundation that supports authenticated users and shared data infrastructure.

Scope included the initial application setup, authentication integration, database foundation, initial profile persistence, and baseline development and verification conventions.

**Completion condition:** The user confirmed that the foundation is fully working and complete. This milestone is closed.

### M1 — Job Discovery and Job Feed

**Status: In progress**

**Outcome:** A usable, tested Job Discovery experience that presents real, persisted opportunities from approved sources.

Scope includes:

- Validating suitable job sources and their access terms.
- Establishing a normalized job data model and persistence.
- Building reliable source ingestion, refresh and deduplication.
- Providing job feeds, details, search and filters.
- Supporting save and dismiss actions with appropriate persistence.
- Distinguishing the discovery source from the destination where a user applies.
- Handling unavailable sources, incomplete listings and errors honestly.
- Verifying security, reliability, accessibility and the end-to-end experience.

M1 does not include Profile-dependent match scores, CV tailoring or the complete application lifecycle. Job Discovery must not imply that opening an external application page submits an application.

**Dependency:** M0.

**Completion condition:** The agreed M1 scope works against persisted job records, required verification passes, limitations are documented, and the user explicitly accepts the milestone.

Detailed scope and checkpoint records belong in the M1 milestone document.

### M2 — Profile and CV Import

**Status: Not started**

**Outcome:** A reliable Profile containing confirmed professional information and an imported, reviewable master CV.

Scope includes:

- Defining the profile data contract and persistence.
- Allowing users to review and edit professional information.
- Importing CV files and extracting supported information.
- Presenting extracted information for user confirmation.
- Distinguishing confirmed information from unverified extraction.
- Handling incomplete profiles, import failures and corrections.
- Maintaining appropriate data ownership and privacy.

Profile becomes the source of truth for confirmed professional information used by downstream features. AI-extracted information must not silently overwrite confirmed data.

**Dependency:** M0. The existing foundation must remain intact.

**Completion condition:** Profile editing and CV import work reliably, extracted information is reviewable, and security, data integrity and acceptance checks pass.

Detailed checkpoints belong in the M2 milestone document.

### M3 — Job Matching and Fit Analysis

**Status: Not started**

**Outcome:** An explainable assessment of how a user's confirmed professional evidence aligns with a job's requirements.

Scope includes:

- Extracting and structuring job requirements.
- Mapping requirements to evidence in the user's Profile and CV.
- Calculating a deterministic, explainable fit estimate.
- Showing matched, partially supported, missing and unverifiable requirements.
- Explaining the evidence behind the assessment.
- Distinguishing confirmed information from inferred information.
- Integrating fit analysis into Job Discovery where appropriate.
- Testing scoring behaviour, edge cases and stale data.

The score is an estimate of fit, not a probability of being hired. Missing evidence must not automatically be treated as proof that the user lacks a qualification. Requirements that cannot be verified must be clearly distinguished from requirements with no supporting evidence.

**Dependencies:** M1 and M2.

**Completion condition:** Matching produces explainable, tested results based on available evidence and handles uncertainty honestly.

Detailed checkpoints belong in the M3 milestone document.

### M4 — CV Studio

**Status: Not started**

**Outcome:** A complete workflow for assessing, tailoring, reviewing, managing and exporting CV versions for specific opportunities.

Scope includes:

- Loading the master CV from Profile when available.
- Supporting CV upload when a master CV is not yet available.
- Accepting a job URL, pasted job description or a job selected from Discovery.
- Handling unreadable job URLs by asking the user to paste the description.
- Recommending whether to use the master CV, reuse an existing tailored version or create a new version.
- Allowing users to review and accept or reject recommendations.
- Supporting AI-assisted tailoring and a live preview.
- Managing versions and providing appropriate comparison and export workflows.
- Preserving the master CV and confirmed Profile information.

AI must not invent qualifications, credentials, employment history or experience. It must not silently overwrite the master CV or confirmed Profile data.

**Dependencies:** M2 and M3, with M1 providing the Discovery integration.

**Completion condition:** Users can prepare and review a job-specific CV, manage versions and export the chosen version without losing the integrity of their original information.

Detailed checkpoints belong in the M4 milestone document.

### M5 — Job Tracking

**Status: Not started**

**Outcome:** A reliable record of actual job applications and their complete lifecycle, from submission through the final outcome.

Scope includes:

- Recording applications to jobs found through Thungatha or externally.
- Capturing the employer, role, application date and source where known.
- Linking the CV version and submitted materials to the application.
- Tracking statuses and status history.
- Recording recruiter contacts, interviews, notes, follow-ups, rejections and offers.
- Providing application lists and detailed records.
- Providing a quick-recall view of what was submitted, what happened and what action is next.
- Linking relevant Discovery jobs and CV Studio versions without confusing discovery with application submission.

An application record is created when the user confirms a submission or explicitly records an application they already made. Discovering, saving or dismissing a job does not itself create an application record.

**Dependencies:** M1 for Discovery integration and M4 for CV version integration. M2 supplies confirmed Profile information where needed.

**Completion condition:** Users can reliably record applications, preserve the materials associated with them, update progress and review their outcomes.

Detailed checkpoints belong in the M5 milestone document.

### M6 — Account, Integration and Release Readiness

**Status: Not started**

**Outcome:** A coherent, secure, accessible and release-ready Thungatha experience across all implemented milestones.

Scope includes:

- Completing Account preferences and settings.
- Finalising the public landing page and overall navigation.
- Integrating Job Discovery, Profile, Matching, CV Studio and Job Tracking.
- Verifying authentication, authorisation and data isolation across the product.
- Reviewing privacy, data integrity and external-service configuration.
- Checking responsive behaviour, accessibility and performance.
- Completing cross-feature regression and production-readiness checks.
- Documenting deployment, configuration, known limitations and operational requirements.
- Demonstrating the integrated product for final user review.

This milestone integrates and verifies earlier work; it must not be used to conceal unfinished mandatory functionality from previous milestones.

**Dependencies:** M1, M2, M3, M4 and M5.

**Completion condition:** The integrated product passes its required release checks, remaining limitations are disclosed, and the user explicitly accepts the release.

Detailed checkpoints belong in the M6 milestone document.

## 5. Milestone Dependencies and Execution Order

The intended milestone sequence is:

**M0 → M1 → M2 → M3 → M4 → M5 → M6**

The main functional dependencies are:

- M1 establishes Job Discovery.
- M2 provides confirmed Profile information and the master CV.
- M3 uses job requirements and Profile evidence to calculate fit.
- M4 uses the master CV and job information to manage tailored CV versions.
- M5 links actual applications to relevant jobs and submitted CV versions.
- M6 verifies the integrated product and release readiness.

The sequence is the planning baseline. Dependencies must be respected, and any proposed change to milestone order or scope requires explicit review and approval.

## 6. Cross-Milestone Engineering Requirements

Every milestone must preserve the following requirements:

- **Preserve working functionality:** extend the existing application rather than replacing it without an approved reason.
- **Security:** enforce authentication, authorisation and user data isolation on the server and in the database where applicable.
- **Data integrity:** validate inputs, preserve meaningful history and avoid destructive updates without user intent.
- **AI boundaries:** validate AI output, protect credentials and personal information, and provide appropriate failure handling.
- **Accessibility and responsiveness:** verify keyboard use, focus, labels, layout and relevant screen sizes.
- **Testing:** run relevant unit, integration, API and end-to-end checks as appropriate to the milestone.
- **Evidence:** record commands actually run, results, known failures and unresolved limitations.
- **Documentation:** update the relevant architecture, decisions, setup and milestone records when implementation changes them.
- **User acceptance:** do not treat code completion alone as milestone acceptance.

## 7. Progress and Acceptance Rules

Use only these status values:

- **Not started**
- **In progress**
- **Blocked**
- **In review**
- **Accepted**

A checkpoint is accepted only when its required work, verification evidence and review are complete. A milestone is accepted only when all mandatory checkpoints and acceptance criteria are satisfied, or any exception has been explicitly approved and documented.

Update the detailed milestone document first when a checkpoint changes. Then update this master plan's milestone status, evidence summary and next action.

Never fabricate verification evidence, silently change agreed scope, or mark work complete because it is planned or partially implemented.

## 8. Final Product Acceptance

Thungatha is ready for final release only when:

- All mandatory milestones are accepted.
- The three primary experiences work together as agreed.
- Profile and Account capabilities work as specified.
- Authentication, authorisation and user data isolation have been verified.
- Core workflows have passed their required tests.
- AI and external-service failures are handled appropriately.
- Accessibility, responsiveness, performance and privacy have been reviewed.
- Setup, configuration, deployment and known limitations are documented.
- The integrated product has been demonstrated and explicitly accepted by the user.

**M0 is already complete.** Final product acceptance remains a separate decision that depends on completing and verifying the remaining milestones.

---

## 9. Document Ownership

| Document | Responsibility |
|---|---|
| `IMPLEMENTATION-PLAN.md` | Overall roadmap, milestone summaries, dependencies and status |
| `docs/PRODUCT-SPECIFICATION.md` | Product behaviour, features and user workflows |
| `docs/ARCHITECTURE.md` | Application structure, technology choices, security and data access |
| `DECISIONS.md` | Approved decisions and their rationale |
| `AGENTS.md` | Instructions for AI coding agents |
| `milestones/Mx-.../` | Detailed milestone scope, checkpoints, evidence and acceptance |
| `README.md` | Project introduction, setup and development commands |

This document governs the overall roadmap. It does not replace the detailed milestone specifications.

## M1-C04 — Job ingestion reliability checkpoint (2026-10-16)

**Status: database-side checkpoint verified.** The production Supabase migration `20261016000100_job_ingestion_reliability.sql` was applied successfully. Local and remote migration history matched, and `supabase db lint --linked --schema public` reported no schema errors.

The SQL smoke test returned `PASS`: one record received, one job inserted, one source record created, zero updates, zero skipped records, and the ingestion run status was `succeeded`. The test transaction ended with `ROLLBACK`; a follow-up count confirmed zero retained smoke-test runs and source records.

**Scope of evidence:** this verifies the tested database RPC path only. It does not establish that every provider integration, scheduled execution, or the full application ingestion pipeline has been end-to-end verified. Do not repeat C04 checks unless a concrete failure appears.

**C05 status:** Under investigation — no AI extraction implementation is approved yet. The decision is deferred until the source/content audit establishes a concrete need. Do not mark C05 accepted or imply that investigation is complete.

**Next active checkpoint:** M1-C06 — Discovery query and action contracts. Backend/API implementation has started on `dev`; see the detailed milestone record for endpoint scope and verification status. C05 remains open and must be resolved before M1 acceptance.


## M1-C05 status update — 2026-10-16

**Status: Under investigation; implementation decision pending.** The checkpoint will determine whether any concrete job-content extraction gap justifies AI. No AI extraction feature is approved or claimed complete. Deterministic validation, normalization, deduplication and persistence remain authoritative, and Discovery must remain usable with AI disabled.

**Sequencing decision:** proceed with M1-C06 — Discovery query and action contracts, because its documented scope is API/data-operation work and does not require AI extraction. C05 remains open; this does not change the M1 checkpoint requirements or constitute C05 acceptance.
