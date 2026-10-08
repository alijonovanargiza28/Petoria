# Beauty Studio Backend Agent Instruction

Beauty Studio is a NestJS GraphQL monorepo migrated from
a real estate platform into a beauty salon management platform.

## Read First

Before changing code, read the current AI handoff docs:

- `docs/BACKEND_MIGRATION.md`
- `docs/DECISIONS.md`
- `docs/COMPLETED_TASKS.md`
- `docs/NEXT_STEPS.md`

Use those files as the source of truth for AI Agent related
migration history, accepted decisions, remaining work
and validation status.

## Project Shape

- Backend apps are `beauty-studio-api` and `beauty-studio-batch`.
- Keep the existing NestJS resolver/service/module pattern based on MVC and DI.
- Keep DTOs, enums, schemas under `apps/beauty-studio-api/src/libs`.
- Keep shared modules reusable: auth, member, like, view, comment, follow, board article, socket.

## Domain Rules

- Use Beauty Studio/service terminology for the main catalog entity.
- Do not reintroduce property or real-estate fields.
- Use `MemberType.CLIENT`, `MemberType.MASTER`,
  `MemberType.RECEPTIONIST` and `MemberType.ADMIN`.
- Service management belongs to ADMIN.
- Service categories are managed through the Category collection.
- Appointment confirmation belongs to ADMIN or RECEPTIONIST.
- Payments are recorded at the salon only.
- Service-related enum values include:
  - `ServiceStatus`: `ACTIVE`, `PAUSE`, `DELETE`
  - `AppointmentStatus`: `PENDING`, `CONFIRMED`,
    `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW`
  - `PaymentMethod`: `CASH`, `CARD`, `TRANSFER`

## Workflow

1. Analyze before editing.
2. Keep changes small and consistent with existing project patterns.
3. Do not remove working logic unless it is replaced safely.
4. Update `docs/COMPLETED_TASKS.md` after major completed work.
5. Add or update focused tests when behavior changes.

## Validation

Use these checks for backend work:

```bash
npx tsc -p apps/beauty-studio-api/tsconfig.app.json --noEmit
npx tsc -p apps/beauty-studio-batch/tsconfig.app.json --noEmit
npm run build
```

`npm run lint` runs ESLint with `--fix`, so use it only when file rewriting is acceptable!
