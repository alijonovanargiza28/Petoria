# Step 3 — Beauty Studio member roles

Completed 2026-10-08 on refactor/beauty-studio-branding. Stop before Step 4.

## Read-only migration audit

Ran `scripts/audit-member-roles.cjs` against BeautyStudio development with approved network access. It registers no models and uses only a role-count aggregation on members. Result: `roleCounts: []` — no member documents were found, so no stored role migration was required. No account, role, password, collection or index writes were issued. Original Nestars database was never connected to.

If legacy records are added later, report counts and obtain explicit data-migration approval before converting USER→CLIENT and AGENT→MASTER. Original database must never be migrated. Existing physical counter fields, if any, are not unset by this code change.

## Behavior changes

- MemberType now contains CLIENT, MASTER, RECEPTIONIST, ADMIN. Member schema defaults to CLIENT.
- Public MemberInput has no memberType. Signup selects credential fields explicitly and always stores CLIENT, including when called internally with injected privileged fields.
- ADMIN-only createStaffMember accepts MASTER/RECEPTIONIST/ADMIN and hashes credentials; no access token is returned on behalf of the staff account.
- MemberUpdate is self-profile-only, without ID/role/status. MemberAdminUpdate carries the required target ID and privileged role/status fields; updateMemberByAdmin remains ADMIN-only.
- Self-update explicitly selects editable profile fields and hashes password changes; password updates increment authVersion. Admin updates increment authVersion and run schema validators.
- getAgents/AgentsInquiry/agent sorts became getMasters/MastersInquiry/master sorts. Discovery filters active MASTER accounts.
- ADMIN/RECEPTIONIST may query getClientsForStaff; it forces CLIENT filtering regardless of supplied role filter. RECEPTIONIST cannot provision staff, change privileged roles/status, or access ADMIN member management. No booking/payment APIs were added.
- Removed memberProperties and agent-derived memberRank from member schema/GraphQL output and removed member ranking jobs. Member statistics are limited to supported remaining engagement/community counters.

## Authentication and guards

Tokens now contain only sub, memberType, authVersion and formatVersion=1 plus standard JWT timestamps. All earlier token formats require fresh login, including legacy ADMIN tokens. USER/AGENT claims are rejected before member lookup. Each authenticated request reloads the member and requires active status, matching current role and authVersion. Stored password hashes/private profiles are no longer copied into JWT claims.

AuthModule registers the Member model for current-account checks. AuthGuard/RolesGuard/WithoutGuard use strict Bearer parsing; unsupported contexts fail closed. Optional-auth public endpoints still allow no token, but supplied invalid/obsolete tokens are rejected rather than silently treated as guests. Existing WebSocket verification calls AuthService; rejected tokens retain existing gateway guest behavior without authenticated privileges.

## Remaining legacy dependencies

PropertyModule is not removed. Its enum guard references now use MASTER solely for compilation/role compatibility; property CRUD remains temporary legacy behavior. Removed three memberProperties increments/decrements so Property no longer writes obsolete member counters. getAgentProperties and property DTOs/filters/aggregations remain for later retirement.

Batch member rank reset/top-agents scheduling, constant, model registration and service were removed. Property ranking/rollback remains unchanged in function and must be removed in its approved later phase.

Like/View/Follow and community modules still use existing member/legacy target relationships; domain adaptation remains later work. Public member projection/privacy cleanup and upload safety remain existing limitations. MasterService, appointments, finance and target collection completion are not implemented.

No members exist in the audited development database. A first ADMIN must be provisioned through a separately approved bootstrap action before using ADMIN-only staff/catalog APIs; public signup cannot bootstrap an ADMIN. No bootstrap account was created in this step.

## Validation

- Unit suite: 6 suites, 37 tests passed (offline, no database writes).
- Root/API/batch typechecks: passed.
- API and batch builds: passed.
- Focused lint on new auth/guards, new tests, member DTOs/enums/schema, Category and Service: passed.
- Broader auth/member lint: 49 errors, 5 warnings remain in legacy decorators/module layout, resolver upload code and member service. No rules were weakened or unrelated lint errors fixed.
- Original .env, configured .env.beauty-studio and user instructions unchanged by hash comparison.
- Tests cover forced CLIENT signup, injection prevention, hashed staff/profile credentials, master filtering, ADMIN/staff contract metadata, obsolete token rejection, changed roles, blocked/missing accounts and token-version invalidation. Catalog regression tests still pass.
- Current tests differ from the earlier Step 2 snapshot: previously listed category/database config spec files and API e2e file are absent in the current workspace; this step did not delete them or restore user-owned changes.

## Changed source / operational files

- apps/beauty-studio-api/src/libs/enums/member.enum.ts
- apps/beauty-studio-api/src/schemas/Member.model.ts
- apps/beauty-studio-api/src/libs/dto/member/member.ts
- apps/beauty-studio-api/src/libs/dto/member/member.input.ts
- apps/beauty-studio-api/src/libs/dto/member/member.update.ts
- apps/beauty-studio-api/src/libs/config.ts
- apps/beauty-studio-api/src/components/member/member.service.ts
- apps/beauty-studio-api/src/components/member/member.resolver.ts
- apps/beauty-studio-api/src/components/auth/auth.module.ts
- apps/beauty-studio-api/src/components/auth/auth.service.ts
- apps/beauty-studio-api/src/components/auth/guards/auth.guard.ts
- apps/beauty-studio-api/src/components/auth/guards/roles.guard.ts
- apps/beauty-studio-api/src/components/auth/guards/without.guard.ts
- apps/beauty-studio-api/src/components/property/property.resolver.ts
- apps/beauty-studio-api/src/components/property/property.service.ts
- apps/beauty-studio-batch/src/beauty-studio-batch.module.ts
- apps/beauty-studio-batch/src/beauty-studio-batch.service.ts
- apps/beauty-studio-batch/src/beauty-studio-batch.controller.ts
- apps/beauty-studio-batch/src/lib/config.ts
- apps/beauty-studio-api/src/libs/catalog.spec.ts
- New apps/beauty-studio-api/src/components/auth/auth.service.spec.ts
- New apps/beauty-studio-api/src/components/member/member.security.spec.ts
- New apps/beauty-studio-api/src/components/member/member.contract.spec.ts
- New scripts/audit-member-roles.cjs

Handoff docs updated: BACKEND_MIGRATION.md, DECISIONS.md, COMPLETED_TASKS.md, NEXT_STEPS.md and this new STEP3_MEMBERS.md. Earlier working-tree changes were preserved.
