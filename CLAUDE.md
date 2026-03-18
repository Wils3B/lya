# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

lya (Localise Your Application) is an open-source translation management platform. Monorepo with two workspaces: `api/` (NestJS + TypeORM) and `ui/` (React + Vite). No root package.json — each workspace is independent.

## Common Commands

### API (`api/` directory)
```bash
pnpm install              # Install dependencies
pnpm start:dev            # Start dev server with watch mode (port 3000)
pnpm build                # Build for production
pnpm test                 # Run unit tests (Jest)
pnpm test -- --testPathPattern=users  # Run tests for a specific module
pnpm test:watch           # Run tests in watch mode
pnpm test:e2e             # Run E2E tests (requires DB)
pnpm lint                 # Lint (ESLint v9 flat config)
pnpm lint:fix             # Lint and auto-fix
pnpm format               # Format with Prettier
```

### UI (`ui/` directory)
```bash
pnpm install              # Install dependencies
pnpm dev                  # Start Vite dev server (port 5173)
pnpm build                # TypeScript check + Vite build
pnpm lint                 # Lint
pnpm lint:fix             # Lint and auto-fix
pnpm format               # Format with Prettier
```

### Docker Workflow (requires go-task — https://taskfile.dev)
```bash
task up:postgres          # Start full stack with PostgreSQL
task up:sqlite            # Start with SQLite (no DB container)
task up:<db>              # db = postgres | mysql | mariadb | mongodb | sqlite
task stop                 # Stop current DB stack
task api:shell            # Shell into API container
task api:lint             # Lint API from host
task api:format           # Format API from host
```

## Architecture

### Multi-Database Support (critical)

The API supports 5 databases (PostgreSQL, MySQL, MariaDB, MongoDB, SQLite), one active at a time via `LYA_DB_TYPE`.

**Key constraint:** `main.ts` loads `.env.database` via `dotenv` **before any module imports** because TypeORM decorators execute at import time. The `@UnifiedId()` decorator reads `LYA_DB_TYPE` at decoration time to apply `@ObjectIdColumn()` (MongoDB) or `@PrimaryGeneratedColumn()` (SQL).

All entities extend `BaseEntity` (id, createdAt, updatedAt). All repositories extend `BaseRepository<T>` — always use `findById(id: string)` for lookups, never raw `findOne` with string IDs.

### CQRS Pattern

Every API resource uses `@nestjs/cqrs`. Write operations are Commands, reads are Queries. Controllers inject `CommandBus`/`QueryBus` and dispatch via `.execute()`.

**Critical convention:** Handlers return `null` on not-found — controllers throw `NotFoundException`. Never throw from handlers.

Handler arrays are exported from `commands/handlers/index.ts` and `queries/handlers/index.ts`, then spread into module providers.

### Module Layout
```
api/src/<resource>/
  <resource>.module.ts          # TypeOrmModule.forFeature([Entity]), CqrsModule
  <resource>.controller.ts      # @ApiTags, @ApiOperation on every method
  dto/create-<resource>.dto.ts  # class-validator + @ApiProperty()
  entities/<resource>.entity.ts # Extends BaseEntity
  commands/                     # Command classes + handlers/
  queries/                      # Query classes + handlers/
  repositories/<resource>.repository.ts  # Extends BaseRepository<T>
```

### Migrations

Per-database migration directories in `api/src/migrations/{postgres,mysql,mariadb,mongodb,sqlite}/` — each DB gets its own migrations because TypeORM generates DB-specific SQL. MongoDB migrations are hand-written (schema-less, no auto-generation).

Key commands (run inside `api/` or via Docker):
```bash
pnpm migration:generate src/migrations/<db>/Name  # Generate from entity diff (SQL DBs)
pnpm migration:create src/migrations/mongodb/Name  # Scaffold empty migration (MongoDB)
pnpm migration:run                                  # Apply pending migrations
pnpm migration:revert                               # Revert last migration
pnpm migration:show                                 # Show migration status
```

Taskfile equivalents: `task migration:generate NAME=Foo`, `task migration:run`, etc.

In production, `migrationsRun: true` auto-applies pending migrations on app startup. In development, `synchronize: true` handles schema changes. See `api/MIGRATIONS.md` for full documentation.

### Docker Compose Layering

`compose.yml` (core services) + `compose.override.yml` (dev bind mounts) + per-DB file (`compose.postgres.yml`, etc.). Nginx reverse proxy routes `/api/` → API:3000, `/` → UI:5173.

### UI

React 19 + Vite + TypeScript. Early stage — single landing page, no routing/state management/API client yet. CSS Modules with BEM-like naming.

## Code Conventions

- **Package manager:** pnpm 10+, Node 20+
- **No semicolons**, single quotes, 120 char print width (Prettier)
- **Import order** enforced by ESLint: builtin → external → internal → parent → sibling → index, alphabetized
- **DTOs:** class-validator decorators + `@ApiProperty()` on every field. Use `PartialType` from `@nestjs/swagger` for update DTOs
- **Swagger:** `@ApiOperation({ summary })` on every controller method, `@ApiTags` on controllers
- **Validation:** Global `ValidationPipe({ whitelist: true, transform: true })` in main.ts
- **Testing:** Unit tests co-located as `*.spec.ts`. E2E in `api/test/`. Controllers mock CommandBus/QueryBus; handlers mock repositories
