# Database Migrations

This document covers the migration system for the lya API, which supports PostgreSQL, MySQL, MariaDB, SQLite, and MongoDB.

## Directory Structure

```
api/src/migrations/
  postgres/     # PostgreSQL-specific migrations
  mysql/        # MySQL-specific migrations
  mariadb/      # MariaDB-specific migrations
  sqlite/       # SQLite-specific migrations
  mongodb/      # MongoDB hand-written index/schema migrations
```

Each database type has its own directory because TypeORM generates DB-specific SQL. Migrations generated for PostgreSQL will not work on MySQL and vice versa.

## Commands

All commands are run from inside the Docker container (`task api:shell`) or via task shortcuts:

| Command | Description |
|---------|-------------|
| `pnpm migration:run` | Apply all pending migrations |
| `pnpm migration:revert` | Revert the last applied migration |
| `pnpm migration:show` | List all migrations and their status |
| `pnpm migration:generate src/migrations/<db>/<Name>` | Generate a migration from entity diff |
| `pnpm migration:create src/migrations/<db>/<Name>` | Create a blank migration file |

### Via task (from project root)

```bash
task migration:run
task migration:revert
task migration:show
task migration:generate NAME=AddUserRole   # generates for current DB type
task migration:create NAME=CustomChange    # creates blank for current DB type
```

## Generating Migrations

TypeORM can automatically generate migrations by diffing your entities against the current database schema. Use this after adding or modifying entities.

```bash
# 1. Start the stack for the target DB
task up:postgres

# 2. Shell into the container
task api:shell

# 3. Generate migration (TypeORM diffs entities vs DB)
pnpm migration:generate src/migrations/postgres/AddUserRole

# 4. Review the generated file before committing
```

**Important:** Always review generated migrations before committing. TypeORM may generate destructive changes (e.g., dropping columns) that need to be handled carefully in production.

## Creating Blank Migrations

For custom logic that cannot be auto-generated (data transforms, index creation, MongoDB changes):

```bash
pnpm migration:create src/migrations/postgres/SeedDefaultRoles
```

This creates an empty migration with `up()` and `down()` methods to fill in manually.

## MongoDB Migrations

MongoDB is schema-less, so TypeORM cannot diff entities against the database. All MongoDB migrations must be hand-written. Use them for:

- Creating indexes (especially unique indexes)
- Data transformations
- Collection renames

Example pattern:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddEmailIndex1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const db = queryRunner.connection.driver.mongodb
    const collection = db.collection('user')
    await collection.createIndex({ email: 1 }, { unique: true, name: 'IDX_user_email' })
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const db = queryRunner.connection.driver.mongodb
    const collection = db.collection('user')
    await collection.dropIndex('IDX_user_email')
  }
}
```

## Multi-DB Workflow

When adding a new entity or changing schema, you must create migrations for **all 5 databases**:

```bash
# PostgreSQL
task up:postgres && task api:shell
pnpm migration:generate src/migrations/postgres/MyChange

# MySQL
task stop && task up:mysql && task api:shell
pnpm migration:generate src/migrations/mysql/MyChange

# MariaDB
task stop && task up:mariadb && task api:shell
pnpm migration:generate src/migrations/mariadb/MyChange

# SQLite
task stop && task up:sqlite && task api:shell
pnpm migration:generate src/migrations/sqlite/MyChange

# MongoDB (hand-written — generate is a no-op for schema)
task stop && task up:mongodb
# Manually create: pnpm migration:create src/migrations/mongodb/MyChange
```

Use the same timestamp prefix across all DB types for a logical grouping.

## Development vs Production

- **Development** (`NODE_ENV !== 'production'`): `synchronize: true` — TypeORM auto-syncs schema. Migrations are available but not required for local dev.
- **Production** (`NODE_ENV === 'production'`): `synchronize: false`, `migrationsRun: true` — migrations run automatically on startup.

## DB-Specific Notes

### PostgreSQL
- Uses `now()` for timestamp defaults
- Integer primary keys with `SERIAL` (auto-increment)

### MySQL / MariaDB
- Uses `CURRENT_TIMESTAMP(6)` for datetime defaults (microsecond precision)
- `int AUTO_INCREMENT` primary keys
- Column lengths required for `varchar` (e.g., `varchar(255)`)

### SQLite
- Uses `CURRENT_TIMESTAMP` for datetime defaults
- `integer` primary key (SQLite rowid alias)
- No `onUpdate` trigger support — application handles updatedAt

### MongoDB
- No SQL migrations — hand-write index and data migrations only
- `synchronize: true` in dev creates collections automatically
- TypeORM's migration table (`migrations`) is stored as a MongoDB collection

## CI / Automation

In CI, set `NODE_ENV=production` to disable `synchronize` and enable `migrationsRun`. Ensure migrations are run as part of deployment before the application starts serving traffic.
