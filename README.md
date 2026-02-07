# lya

Localise Your Application (lya) is a fully open-source platform to manage translations for any app.

## Key features

- Fully open source and community driven
- Translation management with organizations and projects
- Flexible locale setup per project
- Bulk import/export in common formats (JSON, XML, PHP, etc.)
- Automated status flags for translations
- Translation history management to retrieve previous values
- Clear HTTP API to read and update translations
- Automated translations via bots and AI

## Repository structure

- api: Backend API (NestJS)
- ui: Frontend UI (React + Vite)
- compose.yml: Base Docker Compose services for development
- compose.override.yml: Local dev overrides (live-reload)
- nginx/conf.d/dev.conf: Nginx dev reverse proxy

## Getting started

### Prerequisites

- Docker and Docker Compose

### Development (Docker)

1. Start the dev stack:
   ```bash
   docker compose up --build
   ```
2. Open the app:
   - UI: http://localhost/
   - API: http://localhost/api/

TODO: document database setup and environment variables.

## Configuration

TODO: document required environment variables and configuration files.

## API reference

TODO: document authentication, endpoints, and examples.

## Localization formats

TODO: list supported import/export formats and examples.

## Contributing

TODO: add contribution guidelines.

## Roadmap

TODO: outline upcoming milestones and features.

## License

MIT. TODO: add the LICENSE file.
