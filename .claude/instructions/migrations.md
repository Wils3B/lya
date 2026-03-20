# Migration Workflow Instructions

## Overview

The project uses TypeORM migrations with per-DB directories. Each of the 5 supported databases (postgres, mysql, mariadb, sqlite, mongodb) has its own migration directory at `api/src/migrations/<db>/`.

## When to Create Migrations

Create migrations whenever you:
- Add a new entity
- Add, remove, or modify columns on an existing entity
- Add or remove indexes or unique constraints
- Need to transform existing data

## Per-DB Requirement

Every schema change needs migrations for **all 5 database types**. TypeORM generates DB-specific SQL, so migrations are not portable across database types.

MongoDB is schema-less — its migrations are hand-written (indexes, data transforms only). See `api/MIGRATIONS.md` for the MongoDB pattern.

## Naming Convention

Use a Unix timestamp prefix followed by a descriptive name in PascalCase:

```
<timestamp>-<PascalCaseName>.ts
```

Use the same timestamp across all 5 DB directories for the same logical change. Generate the timestamp with: `date +%s%3N` (milliseconds).

## Generating Migrations (SQL databases)

Always generate from inside the Docker container where the DB is reachable:

```bash
task up:<db>         # e.g. task up:postgres
task api:shell       # shell into container
pnpm migration:generate src/migrations/<db>/<Name>
```

Review the generated file — TypeORM may include unintended changes.

## Creating Migrations (MongoDB or custom logic)

```bash
pnpm migration:create src/migrations/<db>/<Name>
# Then fill in up() and down() manually
```

## Running Migrations

```bash
task migration:run      # applies pending migrations
task migration:show     # shows status of all migrations
task migration:revert   # reverts last applied migration
```

## Key Files

| File | Purpose |
|------|---------|
| `api/src/config/database-options.ts` | `buildDataSourceOptions()` — shared config for NestJS runtime and TypeORM CLI |
| `api/src/config/data-source.ts` | TypeORM CLI entry point — loads `.env.database` before imports |
| `api/src/config/database.config.ts` | NestJS `registerAs` wrapper around `buildDataSourceOptions()` |
| `api/tsconfig.migration.json` | TypeScript config for TypeORM CLI (commonjs, not nodenext) |
| `api/MIGRATIONS.md` | Full reference documentation |

## Important Notes

- `data-source.ts` uses `require()` for TypeORM/entity imports (not `import`) so that `dotenv.config()` runs before `@UnifiedId()` decorator executes. Do not convert these to `import` statements.
- `synchronize: false` is set for all environments.
- `migrationsRun: true` auto-applies pending migrations on startup.
