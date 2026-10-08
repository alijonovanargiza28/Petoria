# Step 1: database isolation and environment safety

Implemented on `refactor/beauty-studio-branding`. No live MongoDB was provisioned or contacted. Application isolation is enforced in code; credential restrictions and server provisioning require operator setup before connected tests or startup.

## Configuration

Both applications load `.env.beauty-studio`, never the original `.env`. Copy `.env.beauty-studio.example` to that ignored file and supply a dedicated MongoDB URI and a fresh `SECRET_TOKEN`. Do not reuse original credentials or secrets. Never put secrets in Git.

| NODE_ENV (required) | BEAUTY_MONGO_DB_NAME (required) | URI database path |
|---|---|---|
| development | BeautyStudio | /BeautyStudio |
| test | beauty_studio_test | /beauty_studio_test |
| production | beauty_studio_prod | /beauty_studio_prod |

`BEAUTY_MONGO_URI` must use mongodb:// or mongodb+srv:// with an explicit database matching the name above. Missing/unknown NODE_ENV, missing URI/name, mismatched environments and URI dbName overrides fail before connection. MONGO_DEV/MONGO_PROD are never connection fallbacks; if supplied they are checked for known database-name collisions. Error messages do not print the URI or credentials.

Use separate restricted MongoDB users with readWrite access only to their Beauty Studio database. Never grant access to original Nestars databases. These permissions must be configured and verified by the operator; application configuration cannot guarantee server permissions. Provision a replica set before future transactional booking tests. Automatic collection/index creation is disabled in every environment; future index setup requires an approved deployment procedure.

API/batch example ports are 3000/3001. Supply configuration per process/environment. Shell environment overrides dotenv values. For e2e tests, Jest's NODE_ENV=test requires the test database in BOTH URI and name. Do not point tests at development/production. Test configuration need not be committed.

## Scope

Original `.env`, Git history, schemas/collections, business modules, MemberType, authentication and guards are unchanged. Legacy Property and AGENT functionality still exists because Step 1 does not authorize removal. No live application, batch job, migration or database-connected e2e test was run.

## Tooling

ESLint uses the already-installed @typescript-eslint/parser and plugin rather than the missing typescript-eslint umbrella package. Existing rule intent is retained; no dependency or lock changes. Starter e2e Supertest type/import errors were fixed and batch test teardown added. Use `npm run lint:check`; `npm run lint` still rewrites files.

See [completed tasks](COMPLETED_TASKS.md) for results and [next steps](NEXT_STEPS.md) for the next approval gate.

## Modified / added files in Step 1

- `.gitignore`
- `.env.beauty-studio.example` (new)
- `eslint.config.mjs`
- `apps/beauty-studio-api/src/app.module.ts`
- `apps/beauty-studio-api/src/database/database.module.ts`
- `apps/beauty-studio-api/src/libs/database.config.ts` (new)
- `apps/beauty-studio-api/src/libs/database.config.spec.ts` (new)
- `apps/beauty-studio-api/test/app.e2e-spec.ts`
- `apps/beauty-studio-batch/src/beauty-studio-batch.module.ts`
- `apps/beauty-studio-batch/src/database/database.module.ts`
- `apps/beauty-studio-batch/test/app.e2e-spec.ts`
- `docs/ai/BACKEND_MIGRATION.md`
- `docs/ai/DECISIONS.md`
- `docs/ai/COMPLETED_TASKS.md`
- `docs/ai/NEXT_STEPS.md`
- `docs/ai/STEP1_ENVIRONMENT.md` (new)

Existing AGENTS.md/SKILLS.md changes and untracked skills/ were present before this work and were not modified. Dependencies/package-lock and all business source were preserved.

## Final checks

- Full root and both application typechecks: passed.
- Both Nest application builds: passed.
- Unit tests: 2 suites, 16 tests passed; no database connection.
- Focused lint on validator, its tests, both database modules and both e2e test files: passed.
- Full lint now runs: 820 errors and 15 warnings in legacy source; predominantly formatting (676 reports), unsafe member access (50), unsafe assignments (27), unsafe calls (20), and unused variables (20). No rules were weakened. Counts are captured for that lint run rather than claimed as permanent.
- Git whitespace check: passed after removing trailing whitespace on the edited configuration line.
- Baseline hash checks: original .env, user-owned instructions/skills, MemberType, schema files, auth/guards and business source unchanged.

Do not treat configuration validation as live deployment verification. No database server, restricted user, or replica-set topology was created or validated in this step.

## Development database update

Development now explicitly targets the user's existing `BeautyStudio` database. Test remains `beauty_studio_test`, production remains `beauty_studio_prod`. URI database-path validation, explicit environment/name checks, original-database collision checks and no legacy fallback remain enabled. AutoCreate/autoIndex are false in every environment to protect existing collections and indexes.

The ignored `.env.beauty-studio` was initialized with the development name and an empty URI; credentials must be supplied locally as BEAUTY_MONGO_URI. Original `.env` was not modified.

`npm run db:check` validates configuration, opens a standalone Mongoose connection without models, issues only `{ ping: 1 }`, then closes. It never starts Nest, batch schedules or migrations. The attempted probe stopped before connecting because BEAUTY_MONGO_URI was missing. No original or BeautyStudio database was contacted; live connection remains unverified.

Verification: 17 unit tests, full root typecheck, focused validator lint and both application builds passed. No writing integration tests were run. Full legacy lint debt from Step 1 remains outside this change.

Files changed in this update: package.json; .env.beauty-studio.example; ignored .env.beauty-studio; database.config.ts; database.config.spec.ts; new scripts/check-beauty-database.cjs; this document; COMPLETED_TASKS.md. No MemberType or business modules changed.

## Successful verification after local configuration

On 2026-10-08 the configured `npm run db` probe passed for BeautyStudio after network permission. Only ping was issued; no models were registered and no data/collection/index writes occurred. Earlier missing-URI failures above are historical. Credential privilege restrictions and replica-set capability were not independently audited. See [Step 2 report](STEP2_CATALOG.md).
