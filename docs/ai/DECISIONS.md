# Petoria architectural decisions

## Latest status — Step 3 completed

Target member roles, CLIENT-only signup, ADMIN staff provisioning, master queries and fresh/versioned JWT authorization are implemented. Read-only BeautyStudio role audit found no member documents; no database writes or stored-role conversion were performed. Category/Service remain functional. Property remains temporarily, detached from member-property counters; member/agent ranking jobs are removed. Stop before Step 4 pending approval. See [Step 3 report](STEP3_MEMBERS.md). Earlier sections remain historical snapshots.


## Current status — Step 2 completed

Read-only BeautyStudio connection verification passed. Category and Service modules are implemented with ADMIN management and active-only public discovery; no existing database records/collections were written during this work. MemberType remains USER/AGENT/ADMIN, and Property/AGENT functionality is temporarily preserved. Step 3 requires separate approval. See [Step 2 catalog report](STEP2_CATALOG.md). Earlier sections are historical snapshots.


## Latest status — Step 1

Database isolation is now enforced in application configuration; live databases and restricted credentials have **not** been provisioned or verified. Both apps use `.env.beauty-studio` and environment-specific Beauty Studio database names without legacy fallback. Tooling loader and starter e2e type errors are fixed. Business/role migration remains pending; USER/AGENT/ADMIN and legacy modules remain unchanged until later approved phases. See [Step 1 setup](STEP1_ENVIRONMENT.md). Earlier snapshot sections below describe pre-Step-1 state.


Snapshot: 2026-10-08. Branch: `refactor/beauty-studio-branding`.

Status vocabulary: **Completed** = implemented/verified in the safe rename; **Confirmed** = explicit user requirement, business implementation pending; **Proposed** = audit recommendation or default, not separately approved for implementation. Documentation approval does not authorize business changes.

## Confirmed requirements and completed choices

| Decision / status | Why | Risks | Alternative |
|---|---|---|---|
| Single-location system — Confirmed | User selected studio management rather than marketplace | Future multi-location support requires redesign | Multi-studio marketplace, explicitly outside initial scope |
| ADMIN/RECEPTIONIST/MASTER/CLIENT — Confirmed | Separate salon responsibilities | UI checks alone cannot enforce ownership | Broader generic roles; rejected for target |
| Exactly 18 target models — Confirmed | User specified domain boundaries | Cross-collection consistency needs transactions | Embed all appointment items; conflicts with requested separate model |
| Manual confirmation — Confirmed | Staff control salon scheduling | Staff must respond within hold deadline | Automatic confirmation |
| Configurable 15-minute PENDING hold — Confirmed | Reserve requested time while staff review | Expiration/confirmation races; temporary slot starvation | Pending requests do not reserve slots |
| Sequential multi-master services — Confirmed | One client follows an ordered visit | One unavailable master invalidates the request | Parallel services; outside default workflow |
| Working hours, breaks, time off, no overlaps — Confirmed | Bookings must be executable | Availability queries alone race under concurrency | Manual conflict management |
| Asia/Tashkent, UZS — Confirmed | Salon operational context | Date boundaries and currency rounding | UTC-only business calendar / multiple currencies |
| CASH/CARD/TRANSFER, partial payments/refunds, salon only — Confirmed | User's payment workflow | Duplicate recording and over-refunds | Online gateway or full-payment-only model |
| ADMIN-only expenses — Confirmed | Restrict sensitive financial administration | Permissions must cover queries and mutations | Receptionist expense access |
| MASTER limited to own work — Confirmed | Protect client and financial information | Assigned-item checks needed on every operation | Masters approve bookings/manage pricing; excluded |
| ADMIN/RECEPTIONIST handle booking/scheduling changes — Confirmed | Operational staff control calendar | Changes can conflict with existing reservations | Masters self-edit schedules |
| Preserve infrastructure and replace domains gradually — Confirmed | Reuse established NestJS foundation | Legacy domain coupling remains during transition | Rewrite from scratch |
| Preserve original project/database; separate branch/database — Confirmed | Prevent loss of real estate data | Current DB configuration still points to legacy settings | In-place migration; prohibited |
| Kebab-case apps; PascalCase classes — Completed | Consistent Nest/TypeScript conventions | External launch scripts may need path updates | Mixed-case application directories |
| npm `beauty-studio`, product name Petoria — Completed / documentation convention | Keep approved technical rename; use latest requested product label | Branding is intentionally different from package identifiers | Another technical rename requires a new scope |
| No legacy frontend compatibility for business migration — Confirmed | Enables a domain-correct new contract | Old clients cannot use future replacement APIs | Temporary compatibility layer |

## Proposed architecture and defaults

| Proposal | Why | Risk / alternative |
|---|---|---|
| Keep NestJS, GraphQL, MongoDB; extract shared persistence/domain libraries | Avoid rewriting infrastructure and batch importing API implementation | Requires module/import refactor; alternative is retain current direct imports |
| Replica-set transactions and stable-order writes to affected master records | Serialize overlap checks across requests without adding a nineteenth business collection | Every booking/schedule/time-off write must follow the protocol and retry conflicts; alternative dedicated locks/reservation collection needs revised model scope |
| Deadline-aware availability plus minute-based expiration cleanup | Expired holds stop blocking even if batch is delayed | Requires shared deadline semantics; do not TTL-delete appointment history |
| Transactional notifications with persisted delivery state and retries | Keep recoverable events without losing them after commit | Duplicate delivery possible; clients deduplicate; external broker is an alternative |
| Harden auth before target-role rollout | Audit found caller-settable roles/status, unhashed update passwords, stale JWT privileges | Changes current behavior and needs separate approval; safe rename did not fix these |
| Public/private member projections and redacted logging | Current member output/logging can expose private data | Requires GraphQL changes; alternative field-level policy |
| Integer minor-unit money scalar; immutable snapshots and financial entries | Avoid floating-point totals and historical price drift | Exact scalar/rounding rules need contract finalization; decimal representation is an alternative |
| One role per member | Matches current enum model | Multi-role staff would need policy changes |
| CLIENT can cancel before service begins | Useful self-service default | Cancellation cutoff/fees not user-confirmed |
| Reviews per completed item, once per item | Tie feedback to actual master/service work | Appointment-level review is an alternative |
| Favorite MASTER/SERVICE; Follow MASTER; Like MASTER/PORTFOLIO; View MASTER/SERVICE/PORTFOLIO | Separate bookmarking and appreciation | Supported target sets remain proposed |
| ADMIN manages catalog/prices/overrides; receptionist scheduling/time-off decisions | Consistent with stated MASTER restrictions | Receptionist time-off approval and catalog boundaries need confirmation |
| No promotion stacking; one eligible promotion per appointment | Simple predictable totals | More complex discounts may be needed |
| MASTER earnings = allocated net collections, not payroll | No commission/payroll specification supplied | Allocation/refund rounding needs agreement; commission accounting is an alternative |
| In-app notifications only initially | Existing infrastructure supports this | SMS/email reminders require additional integration approval |
| Pending edits retain original deadline | Prevent indefinite reservation extension | This was proposed, not confirmed; resetting holds is an alternative |

## Open implementation details

Physical new collection names, production MongoDB topology, operating hours, break configuration, payment allocation rules, promotion eligibility, cancellation rules, payroll/commission needs, frontend repository and final GraphQL wire contracts remain unverified. Do not present these as completed or confirmed.

See [backend state](BACKEND_MIGRATION.md), [frontend plan](FRONTEND_MIGRATION.md), [completed work](COMPLETED_TASKS.md), and [next steps](NEXT_STEPS.md).
