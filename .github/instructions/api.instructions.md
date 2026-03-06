---
description: "Use when creating or modifying NestJS API resources, controllers, DTOs, repositories, CQRS commands/queries/handlers, or backend tests in lya. Enforces multi-database and repository/CQRS conventions."
name: "Lya API Conventions"
applyTo:
  - "api/src/**/*.ts"
  - "api/test/**/*.ts"
---

# Lya API Conventions

Follow these rules for backend changes.

## Resource Architecture

- Use CQRS for resources:
  - Writes: commands + command handlers
  - Reads: queries + query handlers
- Resource layout:
  - `<resource>.module.ts`
  - `<resource>.controller.ts`
  - `dto/`
  - `entities/`
  - `repositories/`
  - `commands/handlers/`
  - `queries/handlers/`
- Register new module in `api/src/app.module.ts`.
- Register handlers in module providers with `...CommandHandlers` and `...QueryHandlers`.

## Multi-Database Rules (Critical)

- Do not manually define ID columns on entities.
- All entities must extend `api/src/common/entities/base.entity.ts`.
- `BaseEntity` + `@UnifiedId()` handles MongoDB (`ObjectId`) vs SQL (`PrimaryGeneratedColumn`) behavior.
- For single-record lookup by id, always use repository `findById(id: string)` from `BaseRepository`.
- Do not use string IDs directly in `findOne({ where: { id } })`.

## Entity and DTO Rules

- Entity fields must include both decorators:
  - `@Column()`
  - `@ApiProperty()`
- DTO fields must include:
  - `class-validator` decorators
  - `@ApiProperty()`
- Update DTO should use `PartialType` from `@nestjs/swagger`.

## Controller and Error Handling Rules

- Controllers should dispatch through `CommandBus` and `QueryBus`.
- Add `@ApiTags()` at controller level.
- Add `@ApiOperation({ summary: '...' })` on every endpoint.
- Handlers should return `null` for not-found on update/delete paths.
- Controllers should throw `NotFoundException` after checking returned values.
- Avoid throwing not-found errors from handlers.

## Repository Rules

- Custom repositories should extend `BaseRepository<T>`.
- Inject TypeORM repository via `@InjectRepository(Entity)` and pass into `super(...)`.
- Keep database-agnostic logic in repository or base repository, not in controllers.

## Testing Rules

- Unit tests are co-located as `*.spec.ts`.
- E2E tests live in `api/test/*.e2e-spec.ts`.
- Controller tests:
  - Mock `CommandBus` and `QueryBus` with `useValue`.
- Handler tests:
  - Mock custom repositories with `useValue`.
- Prefer testing behavior and return contracts (`null` vs value), not implementation internals.

## Quality Checks Before Finishing

- Run API checks in container:
  - `task api:shell` then `pnpm test`
  - `task api:shell` then `pnpm test:e2e`
  - `task api:lint`
  - `task api:format`
- Keep import order ESLint-compliant:
  - `builtin` -> `external` -> `internal` -> `parent` -> `sibling` -> `index`
