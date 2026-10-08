# Nestar Next.js → Petoria frontend migration plan

Snapshot: 2026-10-08. **Planning only:** no Next.js frontend exists in the inspected backend repository. Old page/component names below describe conceptual responsibilities, not verified source paths. All destination routes, component names and new operations are **proposals**. Actual App Router/Pages Router structure and GraphQL client must be audited first.

Petoria is the requested product name. Backend project identifiers currently remain `beauty-studio-api` and `beauty-studio-batch`; this document does not rename them.

## Ordered workflow

1. Locate and inspect the frontend repository: Next.js version/router, GraphQL documents/codegen, authentication, shared components, routes, environment variables and tests. Produce an actual path inventory before edits.
2. Check Git status and create an isolated frontend branch. Preserve existing changes. Configure a dedicated future Petoria API endpoint without overwriting the original deployment configuration.
3. Apply Petoria branding and remove real estate terminology in scoped UI changes. Preserve generic form, layout, image and pagination infrastructure where appropriate.
4. Agree on backend GraphQL schema first. Generate typed operations from that schema; do not mechanically rename property fields into service fields.
5. Implement category/service catalog and master profile/portfolio views. Replace real estate filters with category, service, duration and master filters.
6. Implement sequential booking: select ordered services and eligible masters, request availability, submit PENDING request, show server deadline/countdown and staff approval state. Expiration requires a new request; never treat a local countdown as authoritative confirmation.
7. Implement CLIENT, MASTER, RECEPTIONIST and ADMIN dashboards with server-backed permissions. MASTER views only own work and cannot access payment/refund/global-report actions.
8. Implement salon payment entry for ADMIN/RECEPTIONIST: partial CASH/CARD/TRANSFER receipts and refunds. No online checkout. Expenses/global finance stay ADMIN-only; master's own earnings definition requires agreement.
9. Adapt favorites/follows/likes/views and notifications. Fetch persisted notifications after reconnect; do not reuse the global chat payload as private appointment data.
10. Test approved flows against an isolated API/database. Retire old domain screens only after replacements work. Publish separately; keep the original frontend deployment recoverable.

## Conceptual page and component mapping

| Old Nestar responsibility (unverified path) | Proposed Petoria page/route | Proposed component |
|---|---|---|
| Home / featured properties | Home `/` | ServiceHighlights, MasterHighlights |
| Property list/filter | Service catalog `/services` | ServiceCard, CategoryFilter |
| Property detail | Service detail `/services/[id]` | ServiceDetails, EligibleMasters |
| Agent list | Masters `/masters` | MasterCard |
| Agent detail and agent properties | Master `/masters/[id]` | MasterProfile, MasterServices, PortfolioGallery |
| Add/edit property | ADMIN service catalog `/admin/services` | ServiceEditor, MasterServiceAssignment |
| Community articles | Portfolio discovery `/portfolio` | PortfolioCard, PortfolioGallery |
| Article comments | Master/service reviews | ReviewList, VerifiedReviewForm |
| Property favorites / visits | CLIENT bookmarks `/account/favorites`; browsing history if approved | FavoriteList; proposed optional ViewHistory |
| Member profile | `/account/profile` | ProfileForm, PasswordForm |
| Agent workspace | MASTER `/master` | AssignedAppointments, MySchedule, TimeOffRequest, PortfolioEditor |
| Property admin | `/admin`; receptionist `/reception` | AppointmentQueue, SalonCalendar, ClientLookup |
| No direct legacy counterpart | `/book`, `/account/appointments` | SequentialBookingForm, ReservationCountdown, AppointmentTimeline |
| No direct legacy counterpart | Staff payment panel; `/admin/expenses` | SalonPaymentForm, RefundForm, ExpenseEditor |

Routes are tentative and are not implemented. Shared components must follow the discovered frontend conventions.

## GraphQL operation migration plan

The existing operation names below were verified in backend resolvers. Safe rename changed none of them. Future names require backend implementation and schema approval before frontend adoption.

| Existing operation(s) | Proposed future operation(s) | Migration note |
|---|---|---|
| `getProperties`, `getProperty` | `getServices`, `getService` | New filters/types; no direct property DTO reuse |
| `getAgents`, `getAgentProperties` | `getMasters`, `getMasterServices` | Master's catalog availability replaces agent listings |
| `createProperty`, `updateProperty` | `createService`, `updateService` | ADMIN catalog permissions; not MASTER |
| `getAllPropertiesByAdmin`, `updatePropertyByAdmin`, `removePropertyByAdmin` | `getServicesByAdmin`, `updateService`, `archiveService` | Proposed archive protects historical appointments |
| `getFavorites`, `getVisited` | `getFavorites`, `getViewedItems` | Same name may have different result type; Favorite becomes separate from Like |
| `likeTargetProperty`, `likeTargetMember`, `likeTargetBoardArticle` | `setLike` | Proposed explicit desired state and allowed target kinds |
| `getBoardArticles`, `getBoardArticle`, `createBoardArticle`, `updateBoardArticle` | `getPortfolios`, `getPortfolio`, `createPortfolio`, `updatePortfolio` | New owner and publication rules |
| `createComment`, `updateComment`, `getComments` | `createReview`, `updateReview`, `getReviews` | Verified completed-item reviews are not generic comments |
| `subscribe`, `unsubscribe`, `getMemberFollowings`, `getMemberFollowers` | Retain names or approved master-specific equivalents | Target/permission adaptation, not automatic rename |
| `signup`, `login`, `updateMember`, `getMember` | Retain auth names; proposed `updateMyProfile`, `changePassword`, `getMaster` | Separate privileged/private fields |
| `getAllMemberByAdmin`, `updateMemberByAdmin` | Retain or approved staff/client operations | Four-role types must come from future schema |
| No existing counterpart | `getAvailability`, `requestAppointment`, `confirmAppointment`, `rescheduleAppointment`, `cancelAppointment` | New booking domain |
| No existing counterpart | `markArrival`, `startAppointmentItem`, `completeAppointmentItem` | Assigned-master/staff workflows |
| No existing counterpart | `recordPayment`, `recordRefund`, expense/report operations | Salon-only and permission-scoped |

When contracts are ready, update GraphQL documents, generated types, cache keys, fragments, error handling and tests together. Clear domain-specific cached data on deployment/login as needed; legacy responses must not populate new service caches.

## UI terminology

| Old term | Proposed replacement |
|---|---|
| Nestar / Nestars | Petoria |
| Property / listing | Service / treatment |
| Agent | Master / beauty specialist |
| Property type / beds / square / barter / rent | Remove; use category / duration / eligible master |
| Property price | Service price in UZS |
| SOLD | Remove; appointment completion is a different lifecycle |
| Article / community post | Portfolio entry where appropriate |
| Comment | Review only in verified feedback flows |
| USER / AGENT | CLIENT / MASTER; add RECEPTIONIST |
| Buy / checkout | Request appointment / pay at salon |

## Acceptance and unknowns

Test pending expiry/reconnect, multi-master sequence, conflict recovery, permission boundaries, arrival/service execution, partial receipts/refunds and private notifications. Actual frontend file paths, design system, supported languages, router and client library remain unknown. Backend target operations are not available yet.

Related: [backend](BACKEND_MIGRATION.md), [decisions](DECISIONS.md), [next steps](NEXT_STEPS.md).
