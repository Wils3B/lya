# Database Migrations

lya supports 5 databases (PostgreSQL, MySQL, MariaDB, MongoDB, SQLite). Each database has its own migration directory because TypeORM generates DB-specific SQL.

## Directory Structure

```
src/migrations/
  postgres/    # PostgreSQL migrations
  mysql/       # MySQL migrations
  mariadb/     # MariaDB migrations
  mongodb/     # MongoDB migrations (hand-written, see below)
  sqlite/      # SQLite migrations
```

## Quick Reference

| Task | npm script | Taskfile (via Docker) |
|------|-----------|----------------------|
| Generate migration (SQL DBs) | `pnpm migration:generate src/migrations/<db>/Name` | `task migration:generate NAME=Name` |
| Create empty migration (MongoDB) | `pnpm migration:create src/migrations/mongodb/Name` | `task migration:create NAME=Name` |
| Run pending migrations | `pnpm migration:run` | `task migration:run` |
| Revert last migration | `pnpm migration:revert` | `task migration:revert` |
| Show migration status | `pnpm migration:show` | `task migration:show` |

All commands read the active database from `.env.database` (set via `task set-db DB=<type>` or `scripts/set-db-env.sh`).

## Generating Migrations (SQL Databases)

Use `migration:generate` for PostgreSQL, MySQL, MariaDB, and SQLite. TypeORM compares your entities to the current database schema and generates the necessary SQL.

```bash
# Inside the API container:
pnpm migration:generate src/migrations/postgres/AddProjectsTable

# Or from the host via Taskfile:
task migration:generate NAME=AddProjectsTable
```

The Taskfile automatically places the migration in the correct directory based on the active database.

### Important: Schema Must Exist First

`migration:generate` diffs entities against the **current database schema**. If the database was created with `synchronize: true` (development default), the schema is already up to date and TypeORM will report "No changes found." To generate the initial migration:

1. Drop the database (or use a fresh one)
2. Run `pnpm migration:generate src/migrations/<db>/InitialSchema`

## Creating Migrations (MongoDB)

MongoDB is schema-less — `migration:generate` cannot work. Use `migration:create` to scaffold an empty migration, then write the `up`/`down` methods manually.

```bash
pnpm migration:create src/migrations/mongodb/CreateIndexes
```

MongoDB migrations typically manage indexes:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateIndexes1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`db.user.createIndex({ email: 1 }, { unique: true, name: "IDX_user_email" })`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`db.user.dropIndex("IDX_user_email")`)
  }
}
```

## Running Migrations

```bash
# Run all pending migrations
pnpm migration:run

# Check which migrations have been applied
pnpm migration:show

# Revert the last applied migration
pnpm migration:revert
```

In **production**, migrations run automatically on application startup (`migrationsRun: true`). In **development**, `synchronize: true` handles schema changes automatically — you don't need to run migrations manually unless testing the migration workflow.

## Multi-DB Workflow

When adding a new entity or modifying a column, you need a migration for each database:

1. Switch to each DB, generate/create the migration:
   ```bash
   task up:postgres
   task migration:generate NAME=AddLocalesTable

   task up:mysql
   task migration:generate NAME=AddLocalesTable

   task up:mariadb
   task migration:generate NAME=AddLocalesTable

   task up:sqlite
   task migration:generate NAME=AddLocalesTable

   # MongoDB: create + hand-write
   task up:mongodb
   task migration:create NAME=AddLocalesIndexes
   # Then edit the generated file manually
   ```

2. Alternatively, use TypeORM's Schema API (`Table`, `TableColumn`, `TableIndex`) in migrations for a more portable approach — see the initial migrations in each directory for examples.

## DB-Specific Notes

| Database | Notes |
|----------|-------|
| **PostgreSQL** | Full migration support. Uses `SERIAL` for auto-increment, `timestamp` for dates. |
| **MySQL** | Uses `int AUTO_INCREMENT`, `datetime(6)` for dates. Requires `length` on varchar columns. |
| **MariaDB** | Very similar to MySQL. Keep separate directories — they can diverge on advanced features (JSON, CHECK constraints). |
| **SQLite** | Limited `ALTER TABLE` — TypeORM works around this by recreating tables. Migrations may be slower for large tables. |
| **MongoDB** | Schema-less. Only index management via migrations. Always use `migration:create`, never `migration:generate`. |

## CI / Automation

Set `LYA_DB_TYPE` and the corresponding connection variables, then run:

```bash
pnpm migration:run
```

In production Docker images, migrations run automatically on app startup via `migrationsRun: true` in the database configuration.
