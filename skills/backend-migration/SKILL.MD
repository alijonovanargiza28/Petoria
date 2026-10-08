
---
name: backend-migration
description: Continue the Beauty Studio backend migration from Nestar property concepts to Beauty Studio service and appointment concepts while preserving the existing NestJS architecture.
---

# Beauty Studio Backend Migration

Use this skill when changing backend code for the Beauty Studio migration.

## Workflow

1. Search for affected property/service/appointment references before editing.
2. Preserve the resolver/service/module structure already used by `beauty-studio-api`.
3. Keep DTOs, enums, and schemas in their existing folders.
4. Migrate `MemberType.USER | AGENT | ADMIN` to `CLIENT | MASTER | RECEPTIONIST | ADMIN` during the approved member migration step.
5. Use service and appointment terminology for catalog behavior and database lookups.
6. Update social modules consistently when service counters, likes, views, follows, reviews, or notifications are involved.
7. Update batch logic when appointment reminders, booking expiration, or master statistics affect scheduled jobs.
8. Update `docs/COMPLETED_TASKS.md` after major completed work.
