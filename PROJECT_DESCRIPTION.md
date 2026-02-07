# lya

lya stands for Localise Your Application. It helps teams translate any app with a fully open-source platform.

## Features

Core capabilities focused on scalable localization workflows.

- Fully open source and community driven
- Translation management with organizations and projects
- Flexible locale setup per project
- Bulk import/export in common formats (JSON, XML, PHP, etc.)
- Automated status flags for translations
- Translation history management to retrieve previous values
- Clear HTTP API to read and update translations
- Automated translations via bots and AI

## Who it's for

- Product teams shipping multilingual web or mobile apps
- SaaS companies managing many locales across multiple products
- Open-source projects that need a shared, transparent translation workflow

## Use cases

- Centralize translations for multiple apps and services
- Keep locale files in sync with bulk import/export
- Automate translation status updates and review flows

## Technical description

### Project structure
This project uses a single repository for the frontend and backend API:
- Frontend in `ui`
- Backend API in `api`
- Both projects are scaffolded with minimal starter content and will evolve independently.

### Database
To be as flexible as possible, we support several database management systems:
- MongoDB
- MariaDB/MySQL
- Postgresql
- SQLite

Only one DBMS is used at a time. The choice is set via configuration at deploy time.

### Stack
The stack is as follows:

- UI: TypeScript + React + Vite
- API: TypeScript + NestJS
- DB: One of the supported databases listed above

### Docker compose stack
Docker Compose provides a quick local setup for development only.
- `compose.yml` defines the core services (API, UI, and Nginx).
- `compose.override.yml` enables live-reload for the API and UI using bind mounts.
- Nginx proxies `/api` to the backend and `/` to the Vite dev server.
- Environment variables configure the DB connection and API base URL.
- Volumes persist database data across restarts.

### API Resources

#### 1. User
A user can access the platform and belongs to one or more organizations. It has at least the following properties:
- username (unique)
- email (unique)
- password (hashed)
- firstName
- lastName

#### 2. Asset (Translation key)
An asset is a translation key shared across locales. It has at least the following properties:
- key (unique per project)
- description (kept for editors, not required in public fetches)
- createdBy
- createdAt

#### 3. Translation
A translation is a locale-specific value for an asset. It has at least the following properties:
- assetKey
- locale
- value
- status (flag)
- updatedBy
- updatedAt

#### 4. Project
A project represents an application or product area. For example, a SaaS can create frontend, backend, and mobile projects. Members can be assigned to projects with roles.

It will have at least the following properties:
- name
- code (unique per organisation)
- members (users with roles)
- locales

#### 5. Organisation
An organization contains projects and users. Only organization admins can create projects and manage members. Only users of the organization can be assigned to its projects.

It will have at least the following properties:
- name
- code (unique)
- members

#### 6. Locale
Locales define available languages within a project.
- code (BCP-47, example: en-US)
- name
- enabled

#### 7. Membership
Membership ties users to organizations and projects with roles and permissions.
- userId
- scope (organization or project)
- role
- createdAt

#### 8. Import/Export Job
Tracks bulk operations and their status.
- type (import or export)
- format (json, xml, php, etc.)
- status (queued, running, failed, completed)
- stats

#### 9. Bot/Automation
Automations that can create or update translations.
- name
- provider
- scopes
- enabled

## README outline (suggested)

- Project overview
- Key features
- Getting started (prerequisites, setup, run)
- Configuration
- API reference (auth, endpoints, examples)
- Localization formats (supported import/export)
- Contributing
- Roadmap
- License
