# Instructions for AI Coding Agents

## Before starting

1. Read `AGENTS.md` and `PROJECT-CONTEXT.md`.
2. Read the relevant milestone and acceptance criteria in `IMPLEMENTATION-PLAN.md`.
3. Inspect the actual repository, relevant source files, tests, package scripts, and current Git status before proposing or changing code.
4. Open `THUNGATHA-MASTER-PRODUCT-SPECIFICATION.md` or another detailed reference only when the task requires it. Consult the relevant section rather than repeatedly loading every document.
5. If the task depends on a decision marked Open or Provisional in `DECISIONS.md`, surface it before implementing a choice that would be hard to reverse.

## Product and architecture rules

- The master product specification is authoritative for product purpose, scope, principles, business rules, and milestone strategy.
- `PROJECT-CONTEXT.md` is the short operational summary; it does not override the master specification.
- `DECISIONS.md` records approved decisions, provisional directions, and unresolved questions.
- `IMPLEMENTATION-PLAN.md` is the cumulative milestone and checkpoint tracker. Preserve previous checkpoint history; do not replace it with only the latest status.
- Use the supplied `Thungatha – Final Product.html` as a visual reference when building the relevant screen. It contains mock UI/data, not proof that integrations or business behaviour are implemented. Consult only the relevant screen when needed.
- Keep the MVP in one repository and one Next.js modular monolith. Do not introduce microservices or speculative infrastructure.
- Prefer the smallest maintainable implementation. Do not create empty folders, pass-through layers, dependencies, or documentation that do not serve a concrete need.
- Keep proposed, provisional, and open technology choices clearly labelled. Do not silently upgrade dependencies or change major versions.

## Security and data integrity

- Treat browser input, imported CV data, job-provider data, and AI responses as untrusted.
- Resolve authenticated identity server-side. Never treat a client-supplied user ID as proof of ownership.
- Enforce ownership on every user-owned read and write; test cross-user isolation.
- Keep secrets and privileged credentials server-side. Never commit secrets or expose them in client bundles.
- Validate external and AI output against explicit schemas before use.
- AI output must not silently overwrite confirmed profile data, change application status, submit an application, or make an irreversible user decision.
- Preserve provenance and history required by the product. Submitted application materials must remain snapshots rather than changing when the profile changes.
- Do not log raw CVs, secrets, or unnecessary sensitive profile data.

## Implementation workflow

For each meaningful checkpoint:

1. State the intended outcome and scope.
2. Inspect relevant code and dependencies before editing.
3. Implement the smallest coherent change.
4. Add or update tests for the behaviour and failure paths.
5. Run the relevant checks and inspect their actual output.
6. Review the diff for unrelated changes, security issues, and regressions.
7. Update `IMPLEMENTATION-PLAN.md` and `DECISIONS.md` if the checkpoint changes status or resolves a decision.
8. Report files changed, checks run, results, known limitations, and the next checkpoint.

A checkpoint should be independently verifiable. Do not create a checkpoint for every command or trivial edit. Group small edits when they contribute to one testable outcome.

## Verification and reporting

- Never say a test, build, API, browser flow, migration, deployment, or acceptance criterion passed unless it was actually checked.
- Distinguish implemented, tested, reviewed, and accepted states.
- If a command fails, report the failure and its likely cause; do not conceal it.
- Do not weaken or remove tests just to get a green result.
- Do not mark a milestone Accepted until its documented exit criteria are met and the user has reviewed the demonstrated result.
- Ask before making an important product, architecture, privacy, cost, or dependency decision when the available documents do not settle it.

## Git and deployment

- Do not commit, push, create a pull request, or deploy without explicit user approval.
- Do not discard user changes or reset the working tree.
- Check `git status` before and after changes. Do not overwrite unrelated work.
- Never place secrets in example files. Use placeholders and document required variable names only.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
