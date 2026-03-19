# E2E Testing Guide

## Overview

E2E tests live in `api/test/` and run against a real database. The suite covers:
- `app.e2e-spec.ts` — healthcheck endpoint
- `users.e2e-spec.ts` — full CRUD for the users resource

Tests use `beforeEach(cleanDatabase)` for isolation — every test starts with an empty database.

## Architecture

### Why `setupFiles` matters

`@UnifiedId()` reads `process.env.LYA_DB_TYPE` **at decoration time** (when the entity class is first imported). If the env var is not set before Jest loads modules, all entities default to SQL column types — breaking MongoDB tests.

`api/test/setup-env.ts` is referenced via `"setupFiles"` in `jest-e2e.json`. Jest runs `setupFiles` before any test module is imported, ensuring `LYA_DB_TYPE` is available when TypeORM decorators execute.

### Test helpers (`api/test/helpers/`)

| File | Purpose |
|------|---------|
| `create-test-app.ts` | Boots NestJS app with `ValidationPipe` matching `main.ts` |
| `db-cleanup.ts` | Deletes all rows/docs before each test |
| `test-ids.ts` | Returns a valid non-existent ID for the active DBMS |

## Running E2E Tests Locally

### With Docker (preferred)

Start the desired stack, then run tests inside the container:

```bash
task up:postgres     # or up:mysql, up:mariadb, up:mongodb, up:sqlite
task test:e2e        # runs pnpm test:e2e inside the API container
```

### Without Docker (per-DBMS npm scripts)

Each script sets the required env vars inline:

```bash
cd api

pnpm test:e2e:sqlite    # no external DB needed
pnpm test:e2e:postgres  # requires postgres on localhost:5432
pnpm test:e2e:mysql     # requires mysql on localhost:3306
pnpm test:e2e:mariadb   # requires mariadb on localhost:3307
pnpm test:e2e:mongodb   # requires mongodb on localhost:27017
```

> **Warning:** SQL per-DBMS scripts connect to a `lya_test` database. You must create it before running:
> - PostgreSQL: `CREATE DATABASE lya_test; GRANT ALL PRIVILEGES ON DATABASE lya_test TO lya;`
> - MySQL/MariaDB: `CREATE DATABASE lya_test; GRANT ALL PRIVILEGES ON lya_test.* TO 'lya'@'%';`
> - MongoDB: created automatically on first write
> - SQLite: created automatically as `lya-test.sqlite`

The base `pnpm test:e2e` reads DB config from env vars or `.env.database` — useful when env vars are already set (e.g., in CI).

## CI Integration

The `test-e2e` job in `.github/workflows/ci.yml` runs a matrix over all 5 databases with `fail-fast: false`. All service containers start for every matrix entry (SQLite simply ignores them). Per-matrix env vars configure the connection.

### Port mapping in CI

| Database | Host port |
|----------|-----------|
| PostgreSQL | 5432 |
| MySQL | 3306 |
| MariaDB | 3307 (avoids conflict with MySQL) |
| MongoDB | 27017 |

MongoDB in CI runs **without authentication** (no `MONGO_INITDB_ROOT_USERNAME` set).

Test results are uploaded as artifacts (`e2e-results-<dbms>`) on every run, including failures.

## Adding New E2E Tests

1. Create `api/test/<resource>.e2e-spec.ts`
2. Import `createTestApp`, `cleanDatabase`, and `getNonExistentId` from `./helpers`
3. Add `beforeEach(() => cleanDatabase(app))` for test isolation
4. If the resource has a new entity, add it to `ENTITIES` in `api/test/helpers/db-cleanup.ts`

## Troubleshooting

**`@UnifiedId()` uses wrong column type (e.g., ObjectId in SQL)**
→ `LYA_DB_TYPE` was not set before Jest loaded modules. Ensure the env var is set before running Jest, either via inline env var or `.env.database`. Check that `setupFiles` includes `setup-env.ts`.

**Connection refused / timeout**
→ The DB service isn't running. Run `task up:<dbms>` first, or ensure the DB is accessible on the configured host/port.

**`lya_test` database does not exist (PostgreSQL/MySQL/MariaDB)**
→ Create it manually. With Docker, exec into the DB container and run the `CREATE DATABASE` command. CI creates it automatically via service container env vars.

**Tests pass locally but fail in CI**
→ Check if the test leaves data that affects subsequent tests. Ensure `cleanDatabase` is called in `beforeEach`, not just `beforeAll`.
