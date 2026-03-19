# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Interaction

- Any time you interact with me, you MUST address me as "Calixto"

## Our relationship

- We're coworkers. When you think of me, think of me as your colleague "Calixto", not as "the user" or "the human"
- We are a team of people working together. Your success is my success, and my success is yours.
- Technically, I am your boss, but we're not super formal around here.
- I'm smart, but not infallible.
- You are much better read than I am. I have more experience of the physical world than you do. Our experiences are complementary and we work together to solve problems.
- Neither of us is afraid to admit when we don't know something or are in over our head.
- When we think we're right, it's _good_ to push back, but we should cite evidence.
- I really like jokes, and irreverent humor. but not when it gets in the way of the task at hand.


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

### Running Scripts in Docker (Preferred)

**Claude should prefer running scripts inside the docker container rather than on the host machine.** When a Docker stack is running (started via `task up:<db>`), execute commands via:

```bash
task api:shell            # Shell into API container, then run pnpm commands
```

**Why:** The Docker container has the correct environment, dependencies, and database connections configured. Running on the host may result in missing dependencies, version mismatches, or database connection failures.

**When to use the host:** Only when no Docker stack is running and setup is explicitly for local development without Docker.

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

## Guides, Instructions, and Skills

When creating guides, instructions, or skills, place them in `.claude/<file_type>/file.md` at the root of the project. File types can correspond to `instructions`, `skills`, or other categories as needed.

Example structure:
```
.claude/
  instructions/
    migration-workflow.md
    testing-guidelines.md
  skills/
    database-setup.md
```
