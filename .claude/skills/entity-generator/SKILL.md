---
name: entity-generator
description: Scaffold a complete NestJS entity module (CQRS, repository, controller, DTOs, tests). Use when asked to create a new entity, resource, or module in the API.
argument-hint: <entity-name>
disable-model-invocation: true
---

Scaffold a new API entity module for: **$ARGUMENTS**

Derive the following name forms from `$ARGUMENTS`:
- `{Entity}` — PascalCase singular (e.g. `Project`)
- `{entity}` — camelCase singular (e.g. `project`)
- `{Entities}` — PascalCase plural (e.g. `Projects`)
- `{entities}` — camelCase plural (e.g. `projects`)
- `{entity-kebab}` — kebab-case singular (e.g. `project`)
- `{entities-kebab}` — kebab-case plural (e.g. `projects`)

## Steps

1. Read [templates.md](templates.md) — all file templates are there.
2. Create every file listed under **File Templates** in `templates.md`, substituting the name forms above.
3. Register the module in `api/src/app.module.ts` — import the module class and add it to the `imports` array.
4. Create migrations for all 5 databases following `.claude/instructions/migrations.md`.
5. Run `docker compose exec -T lya-api pnpm test` — all tests must pass.

## Key rules

- `CqrsModule` is registered globally via `CqrsModule.forRoot()` in `AppModule` — do **not** import it in the new module.
- Handlers return `null` on not-found — controllers throw `NotFoundException`. Never throw from handlers.
- Always use `findById(id)` for single-record lookups. Never call `findOne` with a raw string ID.
- Every DTO field needs `@ApiProperty()` + class-validator decorators.
- Update DTOs use `PartialType` from `@nestjs/swagger`.
- Every controller method needs `@ApiOperation({ summary })`.
- The "get many" endpoint is **always paginated** — see the Bypass Rules section below for exceptions.
- Import order: builtin → external → internal → parent → sibling → index, alphabetized (ESLint enforced).

## Bypass rules

An entity may support `?pagination=false` for unpaginated access **only** when:
1. The dataset is inherently bounded (e.g. supported locales, languages).
2. Clients have a legitimate need to load all records at once (e.g. populating a dropdown).
3. Explicitly approved and documented in the controller with `@ApiOperation` noting it is allowed.

When adding bypass support, add an optional `pagination` boolean to `PaginationQueryDto` and handle it in the query handler. Users entity never bypasses pagination.
