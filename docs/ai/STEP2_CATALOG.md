# Step 2 — Category and Service catalog

Completed 2026-10-08 on `refactor/beauty-studio-branding`. Step 3 is not authorized.

## Connection verification and data safety

Added `npm run db` as an alias for the existing read-only probe. The initial sandbox attempt failed; the approved network-access retry passed for **BeautyStudio (development)**. The script registers no models and issues only `{ ping: 1 }`; it performs no insert/update/delete, collection creation, index creation or migrations. No original Nestars database connection was opened. This establishes that this verification issued no database writes; it does not assert that unrelated external clients made no changes.

No backend/batch application was started. Development credentials remain solely in the ignored environment file and were not printed or changed. All Step 2 tests use offline model mocks/schema generation, with no MongoDB connections. Any future writing integration tests must use `beauty_studio_test`, not BeautyStudio. Existing automatic collection/index creation safeguards remain false.

## Implemented interfaces

| GraphQL operation | Authorization | Behavior |
|---|---|---|
| createCategory(input: CategoryInput) | ADMIN | Create category |
| updateCategory(input: CategoryUpdate) | ADMIN | Edit/deactivate; no physical delete |
| getCategoriesByAdmin(input: CategoriesInquiry) | ADMIN | List active/inactive categories |
| getCategories(input: CategoriesInquiry) | Public | Only active categories |
| createService(input: ServiceInput) | ADMIN | Requires an active category |
| updateService(input: ServiceUpdate) | ADMIN | Edit, pause, reactivate or archive |
| getServicesByAdmin(input: ServicesInquiry) | ADMIN | Include/filter archived and paused records |
| getServices(input: ServicesInquiry) | Public | ACTIVE services under active categories |
| getService(serviceId: String) | Public | ACTIVE service and active category |

Mutations/admin queries use the existing RolesGuard and MemberType.ADMIN. Existing authentication behavior is preserved; its previously documented role-escalation weaknesses are deferred to the approved future role/auth phase, not claimed fixed here.

Category fields: name, description, image, sort, isActive, timestamps. Service fields: categoryId, name, description, price, duration, image, serviceStatus, serviceViews, serviceLikes, timestamps. Collection names are explicitly `categories` and `services`; they are definitions only and were not provisioned during verification.

ServiceStatus is ACTIVE/PAUSE/DELETE. DELETE archives and is terminal in this implementation. PAUSE can return to ACTIVE if its category is active. No hard-delete operation exists. Category deactivation preserves referenced services and hides them publicly.

No Service.masterId or member ownership fields; MasterService is deferred. No property fields, property counters or engagement updates were copied. Views/likes default to zero until the later engagement adaptation.

Pagination follows list/metaCounter, with page >= 1 and limit 1–100. Sort fields are allowlisted and include a stable _id tie-breaker. Text matching escapes regex metacharacters. Service filters include categoryId, text, min/max price, min/max duration and ADMIN status filtering. Public status/category filtering cannot expose inactive content. Master filters are deferred until MasterService exists.

Price is an ER-aligned numeric UZS catalog value, accepting up to two decimal places through DTO validation. This phase adds no financial accounting or payment scalar. Duration is a positive integer in minutes. Mutable fields are selected explicitly, so extra input cannot set ownership/counters. IDs and update values are validated; query updates use runValidators.

## Preserved and deferred

MemberType remains USER/AGENT/ADMIN. Property, AGENT queries, all existing schemas/modules, auth/guards, Follow/Like/View and batch ranking code are unchanged. Only CategoryModule and ServiceModule were added to ComponentsModule. No MasterService, appointment, payment, role migration or legacy retirement was implemented.

## Files added

- apps/beauty-studio-api/src/components/category/category.module.ts
- apps/beauty-studio-api/src/components/category/category.resolver.ts
- apps/beauty-studio-api/src/components/category/category.service.ts
- apps/beauty-studio-api/src/components/category/category.service.spec.ts
- apps/beauty-studio-api/src/components/service/service.module.ts
- apps/beauty-studio-api/src/components/service/service.resolver.ts
- apps/beauty-studio-api/src/components/service/service.service.ts
- apps/beauty-studio-api/src/components/service/service.service.spec.ts
- apps/beauty-studio-api/src/libs/dto/category/category.ts
- apps/beauty-studio-api/src/libs/dto/category/category.input.ts
- apps/beauty-studio-api/src/libs/dto/category/category.update.ts
- apps/beauty-studio-api/src/libs/dto/service/service.ts
- apps/beauty-studio-api/src/libs/dto/service/service.input.ts
- apps/beauty-studio-api/src/libs/dto/service/service.update.ts
- apps/beauty-studio-api/src/libs/enums/service.enum.ts
- apps/beauty-studio-api/src/libs/catalog.helpers.ts
- apps/beauty-studio-api/src/libs/catalog.spec.ts
- apps/beauty-studio-api/src/schemas/Category.model.ts
- apps/beauty-studio-api/src/schemas/Service.model.ts
- docs/ai/STEP2_CATALOG.md

## Files edited in this step

- package.json: db alias and Jest mapping for existing absolute apps/ imports; no dependency/version changes.
- apps/beauty-studio-api/src/components/components.module.ts: register the two modules; retain all existing imports.
- docs/ai/BACKEND_MIGRATION.md
- docs/ai/DECISIONS.md
- docs/ai/COMPLETED_TASKS.md
- docs/ai/NEXT_STEPS.md
- docs/ai/STEP1_ENVIRONMENT.md

Prior user/Step 1 changes remain preserved; the full working-tree diff includes those earlier changes too.

## Validation

| Check | Result |
|---|---|
| npm run db | Passed; read-only BeautyStudio ping |
| Full root/API/batch typechecks | Passed |
| API and batch builds | Passed |
| Unit suite | 5 suites, 36 tests passed |
| Focused lint on all new catalog files | Passed |
| Full lint | Existing 820 errors / 15 warnings; unchanged count |
| git diff --check | Passed |
| Baseline hashes | Pre-existing app files except ComponentsModule unchanged; env files and user instructions unchanged |

Tests cover module DI, GraphQL schema generation, ADMIN guard metadata and USER/AGENT denial, DTO validation, null rejection, active-category checks, public filtering, archival, reactivation, reversed ranges, literal searches and write-field allowlists. Legacy upload/UUID helpers are mocked only inside the offline contract test; authentication/guard source is unchanged.

Stop here pending approval for Step 3 (role migration).
