# Petoria next working day priorities

## Latest status — Step 3 completed

Target member roles, CLIENT-only signup, ADMIN staff provisioning, master queries and fresh/versioned JWT authorization are implemented. Read-only BeautyStudio role audit found no member documents; no database writes or stored-role conversion were performed. Category/Service remain functional. Property remains temporarily, detached from member-property counters; member/agent ranking jobs are removed. Stop before Step 4 pending approval. See [Step 3 report](STEP3_MEMBERS.md). Earlier sections remain historical snapshots.


## Latest gate — wait for Step 3 approval

Step 2 Category/Service is complete and the BeautyStudio read-only connection check passed. No automated test wrote development data. Next approved phase is the separately gated role migration USER→CLIENT, AGENT→MASTER, addition of RECEPTIONIST. Do not implement it yet. MasterService and booking activation remain later phases. See [Step 2 report](STEP2_CATALOG.md). Earlier checklists below are historical.


## Current approval gate

Step 1 configuration/tooling implementation is complete. Before connected execution, provision separate databases and restricted credentials following [setup](STEP1_ENVIRONMENT.md). Legacy lint debt remains; initial missing-loader and Supertest errors below are historical and fixed. Wait for explicit Step 2 approval before Category/Service or any other business implementation. No MemberType migration yet.


Prepared 2026-10-08 (Asia/Tashkent); next working day reference: 2026-10-09. This is a prioritized backlog, not a promise to finish the migration in one day. Business implementation requires separate approval.

## Backend cleanup

- [ ] **P1:** Review Git status/branch and the six docs; preserve all existing changes.
- [ ] **P1:** Scope and approve tooling cleanup. Repair ESLint's missing `typescript-eslint` setup using compatible installed dependencies or minimal declared dependency changes; fix the two starter Supertest type/import errors. No business changes.
- [ ] **P2:** Plan dedicated development/test/production MongoDB configuration and least-privilege credentials. Never fall back to legacy databases; do not run jobs against them.
- [ ] **P2:** Confirm proposed defaults/open details in [DECISIONS.md](DECISIONS.md), especially time-off approval, review/social targets, cancellation, money allocation, earnings and collection naming.
- [ ] **P3, after approval:** Implement database isolation and shared-library foundations, then identity/permissions, catalog/schedules, transactional bookings, finance, and engagement/notifications in that order.
- [ ] **Later:** Retire real estate modules only after replacement tests pass. No more branding renames without an agreed scope.

## Frontend migration

- [ ] **P1:** Locate and read-only audit the actual Next.js repository; record real routes/components, GraphQL documents, auth and codegen setup.
- [ ] **P2:** Replace conceptual mappings in [FRONTEND_MIGRATION.md](FRONTEND_MIGRATION.md) with verified paths.
- [ ] **P2:** Agree backend contracts before typed frontend operations. Keep original deployment/environment recoverable.
- [ ] **P3, after approval and backend readiness:** Branding/catalog/master views, sequential booking, role dashboards, salon payments and notifications. No gateway checkout.

## Testing

- [ ] **P1:** After tooling cleanup, rerun non-mutating lint, root/application typechecks, both builds and controller unit test. Record exact failures separately.
- [ ] **P2:** Provision an isolated transaction-capable test database before integration/e2e execution.
- [ ] **P3:** Specify tests for concurrent reservations, expiry/confirmation races, working-hours/time-off conflicts, item ownership, role escalation and payment/refund idempotency.
- [ ] **P3:** Add frontend tests after its audit for deadline recovery, permission boundaries and multi-service booking.

## Documentation

- [ ] **P1:** Review completed-versus-proposed labels and preserve existing validation failures.
- [ ] **P2:** Record chosen physical collection names, GraphQL wire contracts, operational hours and financial rules when approved.
- [ ] **P2:** Update [COMPLETED_TASKS.md](COMPLETED_TASKS.md) only after validated implementation; keep [BACKEND_MIGRATION.md](BACKEND_MIGRATION.md) current.
- [ ] **P2:** Use scoped handoff prompts from [PROMPTS.md](PROMPTS.md); document each phase's changes, checks and unresolved risks.
