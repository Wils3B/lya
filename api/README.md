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
