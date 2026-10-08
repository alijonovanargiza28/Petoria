# Nestar → Petoria backend migration

## Latest status — Step 3 completed

Target member roles, CLIENT-only signup, ADMIN staff provisioning, master queries and fresh/versioned JWT authorization are implemented. Read-only BeautyStudio role audit found no member documents; no database writes or stored-role conversion were performed. Category/Service remain functional. Property remains temporarily, detached from member-property counters; member/agent ranking jobs are removed. Stop before Step 4 pending approval. See [Step 3 report](STEP3_MEMBERS.md). Earlier sections remain historical snapshots.


## Current status — Step 2 completed

Read-only BeautyStudio connection verification passed. Category and Service modules are implemented with ADMIN management and active-only public discovery; no existing database records/collections were written during this work. MemberType remains USER/AGENT/ADMIN, and Property/AGENT functionality is temporarily preserved. Step 3 requires separate approval. See [Step 2 catalog report](STEP2_CATALOG.md). Earlier sections are historical snapshots.


## Latest status — Step 1

Database isolation is now enforced in application configuration; live databases and restricted credentials have **not** been provisioned or verified. Both apps use `.env.beauty-studio` and environment-specific Beauty Studio database names without legacy fallback. Tooling loader and starter e2e type errors are fixed. Business/role migration remains pending; USER/AGENT/ADMIN and legacy modules remain unchanged until later approved phases. See [Step 1 setup](STEP1_ENVIRONMENT.md). Earlier snapshot sections below describe pre-Step-1 state.


Snapshot: 2026-10-08, Asia/Tashkent. Branch: `refactor/beauty-studio-branding`.

## Status and original project

**Completed:** repository audit and safe project rename. **Not implemented:** Beauty Studio business modules, new roles, new GraphQL contract, or isolated Beauty Studio database. Petoria is the requested product name in these documents; technical identifiers currently remain `beauty-studio-api`, `beauty-studio-batch`, and npm package `beauty-studio`.

The original Nestar/Nestars backend is a NestJS 10 TypeScript monorepo using code-first GraphQL with Apollo, Mongoose/MongoDB, bcrypt/JWT, guards, GraphQL uploads, a `ws` WebSocket gateway, and scheduled batch jobs. The API implements members, properties, community articles, comments, follows, likes and views. The batch app resets and computes property/agent ranks. Shared schemas, enums and DTOs currently reside inside the API; batch imports API source directly. No Next.js frontend is present in this repository.

## Target and goal — user-confirmed requirements

Petoria is a single-location Beauty Studio Management System with ADMIN, RECEPTIONIST, MASTER and CLIENT roles. Booking requires ADMIN/RECEPTIONIST confirmation. PENDING requests reserve slots for a configurable 15 minutes; expiration cancels them and releases availability. Services run sequentially by default, each AppointmentItem having its own master, start/end time and duration. Prevent master overlaps and respect working hours, breaks and time off.

Use Asia/Tashkent and UZS. Payments occur only at the salon: CASH, CARD, TRANSFER, partial payments and refunds. No payment gateway. Expenses are ADMIN-only. Preserve the original project/database and implement replacements gradually after tests pass.

## Completed naming changes

| Original | Implemented identifier |
|---|---|
| `apps/nestar-api` / Nest project `nestar-api` | `apps/beauty-studio-api` / `beauty-studio-api` |
| `apps/nestar-batch` / Nest project `nestar-batch` | `apps/beauty-studio-batch` / `beauty-studio-batch` |
| `NestarBatchModule`, `NestarBatchController`, `NestarBatchService` | `BeautyStudioBatchModule`, `BeautyStudioBatchController`, `BeautyStudioBatchService` |
| npm `nestars` | `beauty-studio` |
| Nestar welcome text | beautyStudio welcome text |

Imports, output paths, tests and scripts follow the new paths. Incorrect legacy Nest root and `nestars-api` paths were corrected. Domain batch constants and environment keys/values remain unchanged. See [completed tasks](COMPLETED_TASKS.md) and [full rename inventory](../../SAFE_RENAME_REPORT.md).

## Module migration — proposed, not implemented

| Existing area | Proposed treatment |
|---|---|
| Member/Auth/guards | Reuse infrastructure; later harden signup, password updates and authorization; add four target roles |
| Property | Replace listing business behavior with Category, Service, master assignments, availability and Appointment modules |
| BoardArticle/Comment | Replace community use cases with Portfolio and verified Review workflows |
| Follow/Like/View | Preserve now; adapt target references and uniqueness later |
| Notification/Notice schemas | Implement booking notifications; retire legacy notices only after replacement verification |
| Socket | Retain transport; replace global chat with authenticated recipient-specific events |
| Batch | Retain scheduler; replace real estate ranks with pending expiration and notification retries |
| API-owned shared models | Proposed extraction into shared persistence/domain libraries |

Current registered components remain Member, Property, BoardArticle, Auth, Like, View, Comment and Follow. Notification and Notice schema files exist but there are no corresponding registered business modules in ComponentsModule.

## MongoDB schemas and collections

**Current unchanged schema collection names:** `members`, `properties`, `boardArticles`, `comments`, `follows`, `likes`, `views`, `notifications`, `notices`. Their existence in schema files does not prove live database contents. No database operations or migrations were performed.

**User-confirmed target: exactly 18 application collections.** The names below are logical model names; physical new-database collection naming remains to be specified during implementation planning.

| # | Target model | Intended responsibility / relationship |
|---|---|---|
| 1 | Member | Identity, role, status and master/client profiles |
| 2 | Category | Service grouping |
| 3 | Service | Category, description, price and duration |
| 4 | MasterService | Master/service eligibility and proposed overrides |
| 5 | MasterSchedule | Working hours and breaks per master |
| 6 | TimeOff | Requested/approved master absence |
| 7 | Appointment | Client, lifecycle, pending deadline, totals |
| 8 | AppointmentItem | Service/master/time interval per appointment |
| 9 | Payment | Salon receipts, partial payments and refunds |
| 10 | Expense | ADMIN-managed costs |
| 11 | Review | Client feedback and rating |
| 12 | Portfolio | Master-owned work/images |
| 13 | Promotion | Discount rules and validity |
| 14 | Notification | Persistent recipient events/read state |
| 15 | Favorite | Bookmarks independent of likes |
| 16 | Follow | Following master profiles |
| 17 | Like | Appreciation of supported content |
| 18 | View | Deduplicated views of supported targets |

Proposed safeguards: transaction-capable separate MongoDB deployment; immutable appointment price/duration snapshots; indexed references and time ranges; archived catalog records; append-only financial entries. These have not been implemented.

## GraphQL and compatibility

**Completed rename:** no GraphQL types, operations or arguments changed. REST routes and WebSocket event names also remain unchanged. Roles are still USER/AGENT/ADMIN. The updated welcome response is a branding change, not a route change.

**Proposed future contract:** catalog/master/availability queries, `requestAppointment`, `confirmAppointment`, `rescheduleAppointment`, `cancelAppointment`, `markArrival`, `startAppointmentItem`, `completeAppointmentItem`, `recordPayment`, `recordRefund`, and permission-scoped reports. These names are proposals, not existing endpoints. See [frontend operation mapping](FRONTEND_MIGRATION.md).

Legacy frontend/data compatibility is not required for the future business migration. Original real estate records must never be deleted, overwritten or migrated. Separate database credentials/configuration and no fallback to original MongoDB settings are proposed; current `MONGO_DEV`/`MONGO_PROD` settings were preserved, so database isolation is **not yet established**. Do not start connected tests/jobs before isolation is verified.

Related: [decisions](DECISIONS.md), [next steps](NEXT_STEPS.md), [session prompts](PROMPTS.md).
