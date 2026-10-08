# Reusable Petoria migration prompts

These prompts preserve session intent. They do not grant ongoing permission to implement future phases. Read [backend state](BACKEND_MIGRATION.md), [decisions](DECISIONS.md), [completed work](COMPLETED_TASKS.md), [frontend plan](FRONTEND_MIGRATION.md) and [next steps](NEXT_STEPS.md) first.

## Useful session instructions

**Exact excerpt — original audit:**

> Analyze current Nestar monorepo structure to transform existing NestJs Monorepo Nestar platform into Beauty Studio platform

**Summary — product requirements:** single-location studio; ADMIN/RECEPTIONIST/MASTER/CLIENT; exactly 18 target collections; manual approval; configurable 15-minute pending reservation; sequential services with potentially different masters; schedule/break/time-off and overlap checks; Asia/Tashkent; UZS; salon CASH/CARD/TRANSFER; partial payments/refunds; ADMIN-only expenses; reuse infrastructure and preserve original data.

**Exact excerpt — implementation restriction:**

> Do not modify any source files or database records until I explicitly approve implementation.

**Summary — approved safe rename:** use kebab-case application directories/Nest IDs and PascalCase classes; check Git status first; preserve changes/untracked files; rename branding only; keep authentication, roles, GraphQL, REST, WebSocket and domain/database behavior unchanged; run lint/typecheck/build and report errors.

**Exact excerpt — documentation scope:**

> Create only the six requested Markdown files under `docs/`. Application source, configuration, dependencies and databases remain untouched.

## Prompt 1: Read-only handoff audit

```text
Read docs/*.md and SAFE_RENAME_REPORT.md. Check Git status and branch first.
Audit the current backend without editing files, running connected applications,
or accessing MongoDB. Distinguish observed code, confirmed requirements and
proposed defaults. Compare actual state with the docs and report contradictions.
Acceptance: concise module/config/test inventory, remaining errors, open decisions,
and a scoped next-phase plan; no implementation or data changes.
```

## Prompt 2: Tooling cleanup — use only with explicit approval

```text
Fix only existing lint/typecheck tooling failures: missing typescript-eslint
configuration support, API e2e supertest/types resolution and batch Supertest
namespace-call error. Check Git status; preserve other changes. Prefer compatible
existing dependencies; explain any required dependency changes. Do not change
business logic, APIs, schemas, roles, database config or UI branding. Run
non-mutating lint, full/application typechecks, both builds and controller unit
test. Do not start database-connected tests.
Acceptance: report exact changed files, passing checks and remaining failures;
stop after this cleanup.
```

## Prompt 3: Database isolation planning

```text
Plan separate Petoria MongoDB development/test/production configuration based on
current modules and docs. Read configuration code without exposing secrets.
Keep original database names, records and credentials untouched. Propose no
fallback to original settings, restricted credentials, startup validation and
transaction-capable topology. Do not create databases or edit environment files.
Acceptance: concrete configuration/rollout/test plan identifying unknown deployment
facts and safe rollback; isolation must not be claimed as implemented.
```

## Prompt 4: Backend phase planning

```text
Plan only the next approved Petoria backend phase. Read docs and inspect actual
code first. Keep exactly the 18 requested business models and preserve legacy
modules until their replacements pass tests. Identify interfaces, ownership checks,
transaction boundaries, indexes and meaningful acceptance tests. Separate
user-confirmed behavior from defaults requiring agreement. No source or database
changes until implementation is explicitly approved.
Acceptance: decision-complete phase plan with in/out of scope and validation.
```

## Prompt 5: Booking implementation — requires explicit phase approval

```text
Implement only the approved appointment phase in an isolated Petoria database.
PENDING reserves for configurable 15 minutes; staff confirmation before deadline;
expiration cancels/releases; ordered services are sequential with their own master,
start/end/duration. Check eligibility, working intervals, breaks and approved time
off. Serialize competing writes using the approved transaction/locking protocol,
including scheduling changes; never rely only on a find-before-insert query.
Preserve original database and unrelated modules. No online payments.
Acceptance: tests cover concurrent overlap, adjacent slots, multiple masters,
rollback, expiration versus confirmation, rescheduling failure and ownership;
report files/checks and stop at the phase boundary.
```

## Prompt 6: Frontend audit and mapping

```text
Read docs/FRONTEND_MIGRATION.md, then inspect the provided Next.js repository.
Do not invent existing paths. Identify router, GraphQL client/codegen, auth,
components and tests. Map actual Nestar pages/documents to proposed Petoria
services, masters, booking and role dashboards. Mark unavailable backend operations
as proposed; distinguish branding rename from business changes. Do not edit code.
Acceptance: verified file/route/operation mapping, dependencies and phased plan.
```

## Prompt 7: Validation and documentation update

```text
Review Git status and the approved phase scope. Run checks appropriate to the
changes without auto-fixing unrelated files. Use only an explicitly isolated
database for connected tests. Update docs with completed work, exact checks,
remaining errors and unresolved decisions. Do not promote proposals into confirmed
requirements or claim unrun tests passed. Preserve secrets and original data.
Acceptance: traceable change inventory and validation summary; stop after the
approved phase.
```
