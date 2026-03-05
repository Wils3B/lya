# LYA API

The LYA API powers Localise Your Application, the open-source translation management platform. It is built with NestJS and provides HTTP endpoints for managing organizations, projects, locales, translation keys, and translation values.

## Stack

- NestJS + TypeScript
- Swagger/OpenAPI for interactive docs
- Docker-first local development

## Base URL

In the default dev stack, the API is proxied through Nginx:

- API base: http://localhost/api/
- Swagger UI: http://localhost/api/

If you access the API container directly, it listens on port 3000.

## Healthcheck

The API exposes a simple healthcheck endpoint:

```bash
curl http://localhost/api/healthcheck
```

Expected response:

```json
"ok"
```

## Development (Docker)

From the repo root:

```bash
docker compose up --build
```

The API service will rebuild on changes when using the dev override stack.

## Local scripts

If you are running the API outside Docker:

```bash
pnpm install

pnpm start
pnpm start:dev
pnpm test
```

## Configuration

### Database

The API supports multiple database backends via TypeORM. Configuration is handled via environment variables.

Supported drivers: `mysql`, `mariadb`, `postgres`, `sqlite`, `mongodb`.

| Variable | Description | Default |
|----------|-------------|---------|
| `LYA_DB_TYPE` | Type of database (`mysql`, `mariadb`, `postgres`, `sqlite`, `mongodb`) | `sqlite` |
| `LYA_DB_HOST` | Database host | `localhost` |
| `LYA_DB_PORT` | Database port | `3306` (mysql), `5432` (postgres) |
| `LYA_DB_USERNAME` | Database username | `root` |
| `LYA_DB_PASSWORD` | Database password | `password` |
| `LYA_DB_NAME` | Database name | `lya` |
| `LYA_DB_FILE` | (SQLite only) Path to database file | `lya.sqlite` |
| `LYA_DB_URL` | (MongoDB) Full connection URL | `mongodb://localhost:27017/lya` |

### ID Strategy

The system uses a unified ID strategy:
- For SQL databases, IDs are auto-incrementing integers.
- For MongoDB, IDs are ObjectIds.

The API endpoints handle IDs as strings, automatically converting them based on the active driver.

## Users Module (CQRS)

The API currently exposes user CRUD endpoints without authentication:

- `POST /users`
- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id`
- `DELETE /users/:id`

The users module uses the NestJS CQRS pattern:

- **Commands** (`src/users/commands/`) for write actions (`create`, `update`, `delete`)
- **Queries** (`src/users/queries/`) for read actions (`findAll`, `findOne`)
- **Handlers** (`src/users/commands/handlers/`, `src/users/queries/handlers/`) for command/query execution
- **Controller** dispatches via `CommandBus` and `QueryBus`

CQRS is configured at application level in `AppModule` through `CqrsModule.forRoot()`, so the same pattern is ready to be reused by future modules.

To extend this pattern in any module, add a command or query class and register its handler in that module providers.

### Multi-DB ID lookup helper

Multi-DB ID resolution is now implemented in a generic repository base class:

- `src/common/repositories/base.repository.ts` provides `findById(id)` and internally resolves the correct where condition by database type.
- `src/users/repositories/user.repository.ts` extends the generic base repository and injects config to resolve the current database type once in the repository constructor.

This avoids duplicating ID conversion logic in CQRS handlers and enables reuse for future modules that need the same behavior.

Current lookup behavior remains:

- SQL: string ID → numeric ID with `parseInt`
- MongoDB: string ID → `ObjectId`

## Input Validation

Validation is enabled globally in `src/main.ts` with Nest's `ValidationPipe`:

- `whitelist: true` strips unknown fields
- `transform: true` applies runtime payload transformation

DTOs define constraints using `class-validator`. Example from users module:

- `CreateUserDto` validates `name` and `email`
- `UpdateUserDto` uses `PartialType(CreateUserDto)` for partial updates

When extending endpoints, add a DTO and decorate each field with both `@ApiProperty()` and relevant class-validator decorators.

## Planned API (Roadmap)

The following resources are planned and will evolve as the product ships:

- Organizations and members
- Projects and environments
- Locale management
- Translation keys and values
- Import/export in common formats (JSON, XML, PHP, etc.)
- Translation history and audit trail
- Automated translations via bots and AI

## Troubleshooting

- If Swagger does not load at http://localhost/api/, try the direct container URL at http://localhost:3000/.
- If `curl /api/healthcheck` fails, confirm Nginx is up and the API container is healthy.

## License

MIT
