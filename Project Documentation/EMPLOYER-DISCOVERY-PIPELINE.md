# Employer Discovery and Job Ingestion Pipeline

**Status:** Agreed implementation direction; implementation not started  
**Target:** A deliberately small, AI-assisted internal pipeline, with an approximately 24-hour implementation target  
**Scope:** Feed verified and human-approved jobs into the existing Thungatha application. This is not a separate product.

## 1. Goal

Discover employers based on evidence that they advertised relevant roles during the previous six months, verify those employers and their official recruitment sources, find current vacancies, and send qualifying vacancies to an administrator for final approval.

Only vacancies that pass deterministic checks and receive explicit human approval may enter the production jobs catalogue. The existing Thungatha job feed remains the user-facing destination.

## 2. Product rules

- Employer discovery is based on evidence of relevant recruitment activity in the last six months, not a broad search for every company in a location.
- Companies remain in the directory after the six-month discovery window. The window applies to discovery evidence, not company retention.
- Active job listings must have a verifiable publication date within the last 30 days.
- Initial geographic scope is the Western Cape, including Cape Town, Stellenbosch, Somerset West, Bellville, Paarl, George, and other relevant Western Cape locations. A remote role qualifies only when Western Cape applicants are explicitly eligible.
- Include relevant IT/software roles and internships and learnerships, including non-technical internships and learnerships. Exclude graduate programmes.
- Adzuna and Jooble must not be used as active vacancy providers or as sources of jobs displayed in Thungatha. Aggregator results may only be used as optional research leads to identify an employer; all employer and vacancy details must be verified independently.
- Prefer official employer career pages and employer-authorized ATS sources. Confirm permitted access, terms, rate limits, and attribution before production use.
- Never invent a publication date or infer that a historical vacancy remains open.
- AI assists with classification, evidence interpretation, and explanations. Deterministic application code enforces required fields, date and location rules, deduplication, authorization, and state transitions.
- A person must make the final decision for every vacancy before it is published. Company approval does not approve any of its vacancies.
- Preserve existing job history and user activity. A temporary source failure must not automatically delete records or mark vacancies closed.

## 3. Five Azure Functions

Implement five clearly separated functions in **one Azure Function App** initially. Separate responsibilities and test boundaries do not require five independently deployed applications.

### Function 1 — Company Discovery

Search the web for evidence of employers that advertised relevant software development or IT roles during the preceding six months. Produce candidate company records with evidence URLs, observed dates where available, and the search query/source. Do not create active job listings from search results.

### Function 2 — Company Verification

Verify the employer identity, official website, historical recruitment evidence, relevance, and geographic fit. Normalize names/domains and detect duplicates. Candidates that cannot be verified remain pending or are rejected; AI output alone is not proof.

### Function 3 — Careers Source Discovery

Find and validate the official careers page or an employer-authorized ATS source for each verified company. Store the source URL, retrieval method, source type, access notes, and verification status. Do not assume every employer has a public API.

### Function 4 — Job Discovery

Retrieve candidate vacancies only from approved employer sources. Preserve source identifiers, original listing URL, application URL, raw publication date and source evidence, location, title, description, and retrieval timestamp. This function collects candidates; it does not publish them.

### Function 5 — Job Verification and Catalogue Handoff

Validate current availability where determinable, publication date (within 30 days), category, geography, employer/source provenance, application destination, and duplicates. AI may provide a relevance assessment and flag inconsistencies, but cannot override deterministic rules or approve publication. Eligible records move to the human review queue. Publication to the existing Supabase jobs catalogue happens only after explicit approval.

## 4. Temporary processing storage and production data

Use one Azure Storage account as the initial temporary processing boundary. Use a durable table-style store for candidate records and workflow status. Use Blob Storage only when larger evidence snapshots are needed. Do not rely on Azure Functions' local filesystem for shared or durable state.

Temporary records may include candidate companies, historical evidence, unapproved careers sources, candidate vacancies, AI assessments, errors, retry counts, and pending human decisions. Store source URLs and minimal evidence where possible; avoid unnecessary personal data or excessive copied content. Define retention and cleanup for rejected, stale, and raw evidence records.

Supabase remains the production application data store. Verified companies may be saved to a dedicated company directory after company verification, so they can be monitored even when they have no current vacancies. Only vacancies that pass automated checks and receive explicit human approval enter the existing production jobs catalogue. Keep an audit record of human decisions and the evidence version reviewed.

The exact Azure Storage data model should be the smallest design that supports durable processing, retries, and the review queue. Do not add a message broker, separate microservices, or a general agent framework unless implementation evidence proves they are needed.

## 5. Small private admin interface

Add a protected `/admin` area inside the existing Next.js application. It is an internal operational tool, not a standalone application.

Keep the UI to three main areas:

1. **Overview:** counts for discovered/verified companies, sources requiring attention, jobs awaiting approval, approved/rejected jobs, and recent failures.
2. **Review Queue:** tabs or filters for companies, careers sources, and jobs. Open details in a side panel rather than creating many screens. Show source evidence, automated checks, AI assessment, warnings, and the relevant official source/application links.
3. **Settings:** only essential discovery scope, schedules, AI configuration, and retention controls. Do not build a general workflow editor.

The Companies area within the Review Queue must include an **Add Company** action. Manual entry should accept at least a company name; website, careers URL, location, categories, recruitment platform, and notes are optional. The company goes through the same verification path as discovered companies. Check normalized names and official domains before creating a duplicate. Provide a save-for-later option and a verify/monitor action.

The interface must enforce server-side authorization. Approval endpoints must revalidate the record and current eligibility. The browser must never write directly to the production jobs catalogue.

## 6. AI and human decision boundary

AI can help interpret search results and historical job evidence, classify roles, suggest likely official careers sources, extract candidate vacancy fields, explain verification results, and flag inconsistencies.

AI cannot establish truth solely by assertion, fill missing dates with guesses, override policy rules, bypass source verification, or publish records. Validate structured AI responses against schemas and preserve links to supporting evidence. If evidence is missing or conflicting, show an explicit uncertain/review-needed state.

The administrator is the final approver for publication. Record reviewer identity, decision, timestamp, and the version of the evidence reviewed. A material vacancy change after approval must trigger revalidation and, where appropriate, renewed review.

## 7. Scheduling and failure handling

Use different schedules for discovery and monitoring. A reasonable initial proposal is weekly company discovery and daily checks of approved careers sources, subject to source terms, quotas, cost, and observed usefulness. Make schedules configurable without building a complex scheduler UI.

Processing must be idempotent. Retries must not create duplicate companies or vacancies. Track last successful check, attempt count, and failure reason. A temporary failure must not be interpreted as proof that an employer or vacancy is gone.

## 8. Implementation sequence

1. Audit the current `dev` branch, ingestion adapters, API, schema/migrations, secrets, and scheduled execution.
2. Confirm the minimal Azure Storage model, permitted web-search method, AI provider, and approved employer-source access methods.
3. Document and implement the shared record states and contracts.
4. Remove Adzuna and Jooble from active ingestion without deleting job history or user activity.
5. Implement Company Discovery and Company Verification.
6. Implement Careers Source Discovery.
7. Implement Job Discovery and Job Verification.
8. Build the minimal protected admin interface, including manual company entry and human approval.
9. Connect approved vacancies to the existing Supabase catalogue.
10. Test duplicate handling, retries, failed sources, dates, location rules, access control, approval audit, and the existing feed before enabling scheduled production runs.

## 9. Acceptance criteria

- A company can be discovered from relevant recruitment evidence within six months, verified, retained, and monitored even when it has no current vacancy.
- An administrator can add a company manually without bypassing verification.
- Aggregator listings never enter the active job feed.
- Candidate records remain outside the production jobs catalogue until automated checks pass and a human explicitly approves them.
- AI assists with interpretation but cannot override deterministic checks or approve publication.
- Only eligible vacancies published within the previous 30 days are sent for approval.
- The administrator can inspect evidence and approve, reject, or request reverification.
- Duplicate processing, retries, source failures, and changed vacancies are handled safely.
- Existing public/authenticated feed behavior, saved/dismissed state, application activity, and historical data are preserved.
- Secrets remain server-side, admin endpoints are authorized, and the pipeline is tested before production scheduling.

## 10. Delivery expectation and constraints

The approximately 24-hour target is a time-box for a focused MVP, not a guarantee of broad source coverage or production-grade reliability. The target is realistic only if implementation reuses the current repository and Supabase catalogue, uses a small set of permitted search and ATS sources, keeps the admin UI minimal, and defers optional sophistication. Source access approvals, Azure configuration, production security, and real-world validation may require additional time.

Do not claim the full pipeline is complete until source access, storage, end-to-end tests, human approval, and production configuration have actually been verified.
