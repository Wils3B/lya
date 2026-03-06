# Copilot Instructions for lya

lya (Localise Your Application) is an open-source translation management platform. Monorepo with `api/` (NestJS + TypeORM) and `ui/` (React + Vite).

## Architecture

- **API**: NestJS app in `api/`, TypeScript, TypeORM for ORM, Swagger auto-docs. Listens on port 3000.
- **UI**: React + Vite app in `ui/`, TypeScript. Dev server on port 5173.
- **Nginx**: Reverse proxy — `/api/` → API, `/` → UI. Config in `nginx/conf.d/dev.conf`.
- **Docker Compose layering**: `compose.yml` (core) + `compose.override.yml` (dev bind mounts & live-reload) + per-DB compose file (`compose.postgres.yml`, `compose.mongodb.yml`, etc.).

## Multi-Database Support (critical pattern)

The app supports **5 databases**: PostgreSQL, MySQL, MariaDB, MongoDB, SQLite — one active at a time, set via `LYA_DB_TYPE` in `api/.env.database`.

### How it works — read before touching entities or services:

1. `main.ts` loads `.env.database` via `dotenv` **before any module imports** — this is required because TypeORM decorators execute at import time.
2. `@UnifiedId()` decorator (`api/src/common/decorators/unified-id.decorator.ts`) reads `LYA_DB_TYPE` at decoration time and applies `@ObjectIdColumn()` (MongoDB) or `@PrimaryGeneratedColumn()` (SQL).
3. `api/src/config/database.config.ts` switches on `LYA_DB_TYPE` to return the correct `TypeOrmModuleOptions`.
4. Services must handle ID lookups differently per DB — see `PostService.getWhereCondition()` for the pattern: `ObjectId` for MongoDB, `parseInt` for SQL.

### Entity pattern

All entities **must** extend `api/src/common/entities/base.entity.ts`, which provides `id: number | ObjectId`, `createdAt`, and `updatedAt`. Decorate entity columns with both `@Column()` and `@ApiProperty()`.

```typescript
// api/src/post/entities/post.entity.ts — reference example
@Entity()
export class Post extends BaseEntity {
  @Column()
  @ApiProperty()
  title: string
}
```

## Module Structure (NestJS)

Each API resource follows this layout:

```
api/src/<resource>/
  <resource>.module.ts      # NestJS module with TypeOrmModule.forFeature([Entity])
  <resource>.controller.ts  # REST endpoints, @ApiTags, @ApiOperation on every method
  <resource>.service.ts     # Business logic, injected Repository<Entity>
  dto/
    create-<resource>.dto.ts  # DTOs with class-validator decorators
  entities/
    <resource>.entity.ts      # TypeORM entity extending BaseEntity
```

Register new modules in `api/src/app.module.ts` imports array.

## CQRS Architecture

The API uses **`@nestjs/cqrs`** for command-query separation. All write operations are commands, all reads are queries.

### Command Pattern

Commands represent write operations (create/update/delete):

```typescript
// api/src/<resource>/commands/create-<resource>.command.ts
export class CreateResourceCommand extends Command<Resource> {
  constructor(public readonly dto: CreateResourceDto) {
    super()
  }
}
```

**Handler pattern:**

```typescript
@CommandHandler(CreateResourceCommand)
export class CreateResourceHandler implements ICommandHandler<CreateResourceCommand, Resource> {
  constructor(private readonly repository: ResourceRepository) {}
  
  async execute(command: CreateResourceCommand): Promise<Resource> {
    const resource = this.repository.create(command.dto)
    return this.repository.save(resource)
  }
}
```

**Critical:** Update/delete handlers return `Resource | null` (not throw) — let controllers handle not-found errors.

### Query Pattern

Queries represent read operations (get/list):

```typescript
// api/src/<resource>/queries/get-<resource>.query.ts
export class GetResourceQuery extends Query<Resource | null> {
  constructor(public readonly id: string) {
    super()
  }
}
```

**Handler pattern:**

```typescript
@QueryHandler(GetResourceQuery)
export class GetResourceHandler implements IQueryHandler<GetResourceQuery, Resource | null> {
  constructor(private readonly repository: ResourceRepository) {}
  
  async execute(query: GetResourceQuery): Promise<Resource | null> {
    return this.repository.findById(query.id)
  }
}
```

### Controller Integration

Controllers inject `CommandBus` and `QueryBus`, dispatch commands/queries via `.execute()`:

```typescript
@Post()
async create(@Body() dto: CreateResourceDto): Promise<Resource> {
  return this.commandBus.execute(new CreateResourceCommand(dto))
}

@Get(':id')
async findOne(@Param('id') id: string): Promise<Resource> {
  const resource = await this.queryBus.execute(new GetResourceQuery(id))
  if (!resource) throw new NotFoundException()
  return resource
}
```

### Module Registration

Register handlers in module providers:

```typescript
// api/src/<resource>/<resource>.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Resource])],
  controllers: [ResourceController],
  providers: [ResourceRepository, ...CommandHandlers, ...QueryHandlers],
})
```

Export handler arrays from indexes: `commands/handlers/index.ts` and `queries/handlers/index.ts`.

## Repository Pattern

All repositories **must** extend `BaseRepository<T>` for database-agnostic ID handling.

```typescript
// api/src/<resource>/repositories/<resource>.repository.ts
@Injectable()
export class ResourceRepository extends BaseRepository<Resource> {
  constructor(
    @InjectRepository(Resource)
    private readonly repository: Repository<Resource>,
  ) {
    super(repository)
  }
}
```

**Always** use `repository.findById(id: string)` for lookups — it handles `ObjectId` (MongoDB) vs `parseInt` (SQL) conversion automatically. Never use `repository.findOne({ where: { id } })` directly with string IDs.

## Testing Patterns

### Unit Tests (`.spec.ts`)

Co-locate with source files. Mock dependencies with `useValue` provider overrides:

```typescript
const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findById: jest.fn(),
}

beforeEach(async () => {
  const module = await Test.createTestingModule({
    providers: [
      Handler,
      { provide: ResourceRepository, useValue: mockRepository },
    ],
  }).compile()
  
  handler = module.get(Handler)
})
```

**Controllers:** Mock `CommandBus` and `QueryBus`. **Handlers:** Mock repositories.

### E2E Tests (`test/*.e2e-spec.ts`)

Load full `AppModule`, use `supertest` for HTTP testing:

```typescript
beforeEach(async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()
  
  app = moduleFixture.createNestApplication()
  await app.init()
})
```

**Note:** SQLite e2e tests may fail locally if native bindings unavailable (see `/memories/repo/lya-testing-notes.md`). Unit tests run independently.

## Developer Workflow

| Task | Command |
|---|---|
| Start dev stack (e.g. postgres) | `task up:postgres` |
| Start with SQLite (no DB container) | `task up:sqlite` |
| Stop current DB stack | `task stop` |
| Switch database | `task up:<db>` where `<db>` = `postgres\|mysql\|mariadb\|mongodb\|sqlite` |
| API shell | `task api:shell` |
| Lint API | `task api:lint` |
| Format API | `task api:format` |
| Run unit tests | Inside API container: `pnpm test` |
| Run e2e tests | Inside API container: `pnpm test:e2e` |

[Taskfile.yml](../Taskfile.yml) orchestrates everything — uses [go-task](https://taskfile.dev). The `set-db` task writes `api/.env.database` and `.lya-db` (state file tracking active DB).

## Key Environment Variables

| Variable | Purpose |
|---|---|
| `LYA_DB_TYPE` | `postgres\|mysql\|mariadb\|mongodb\|sqlite` |
| `LYA_DB_HOST`, `LYA_DB_PORT`, `LYA_DB_USERNAME`, `LYA_DB_PASSWORD`, `LYA_DB_NAME` | SQL connection |
| `LYA_DB_URL` | MongoDB connection URL |
| `LYA_DB_FILE` | SQLite file path |
| `LYA_ENABLE_SWAGGER` | Set `true` to enable Swagger in production |
| `LYA_API_PREFIX` | Swagger server prefix (default `/`) |

## Code Conventions

- **Package manager**: pnpm (v10+), Node 20+. Lockfiles committed — use `pnpm install --frozen-lockfile` in CI/Docker.
- **Import order**: Enforced by ESLint `import/order` — `builtin` → `external` → `internal` → `parent` → `sibling` → `index`, alphabetized, no blank lines between groups.
- **Error handling**: Services/handlers return `null` on not-found. Controllers throw `NotFoundException` (or other `@nestjs/common` exceptions) after checking for null. Never throw from handlers.
- **DTOs**: Use `class-validator` decorators (`@IsString()`, `@IsNotEmpty()`, etc.) and `@ApiProperty()` on every field. Use `PartialType` from `@nestjs/swagger` for update DTOs.
- **Swagger**: Every controller method gets `@ApiOperation({ summary: '...' })`. Controllers get `@ApiTags('resource-name')`.
- **Validation**: Enabled globally in `main.ts` with `new ValidationPipe({ whitelist: true, transform: true })`.
- **Tests**: Unit tests co-located as `*.spec.ts`; e2e tests in `api/test/*.e2e-spec.ts`. Jest + ts-jest. Use `@nestjs/testing` `Test.createTestingModule`.

## UI Development

**Current state:** Early development — single landing page component.

- **Framework**: React 19 + Vite
- **Styling**: CSS Modules (`*.module.css`) with BEM-like naming. Global reset in `index.css`.
- **No routing yet** — React Router not installed. Add when implementing multi-page navigation.
- **No state management** — Use Context API or install Zustand/Redux when needed.
- **No API client** — Add axios or fetch wrapper when integrating with backend.
- **Structure**: Flat for now (`ui/src/`). Create `components/`, `pages/`, `hooks/`, `utils/` as features grow.
