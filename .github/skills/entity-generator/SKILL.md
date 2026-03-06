---
name: entity-generator
description: 'Generate NestJS entities using CQRS pattern with multi-database support (PostgreSQL, MySQL, MariaDB, MongoDB, SQLite). Use for creating new API resources, models, modules with commands, queries, handlers, DTOs, repositories, and controllers following lya conventions.'
argument-hint: 'Resource name (e.g., "Project", "Organization")'
---

# Entity Generator

Generate complete NestJS resource modules with CQRS pattern, TypeORM entities, and multi-database support for the lya platform.

## When to Use

- Creating a new API resource (Project, Organization, Translation, etc.)
- Adding CRUD endpoints with CQRS command/query separation
- Setting up entities that work across all 5 supported databases
- Following lya's established patterns for TypeORM + NestJS

## What It Generates

A complete module with this structure:

```
api/src/<resource>/
  <resource>.module.ts
  <resource>.controller.ts
  <resource>.controller.spec.ts
  commands/
    create-<resource>.command.ts
    update-<resource>.command.ts
    delete-<resource>.command.ts
    handlers/
      index.ts
      create-<resource>.handler.ts
      create-<resource>.handler.spec.ts
      update-<resource>.handler.ts
      update-<resource>.handler.spec.ts
      delete-<resource>.handler.ts
      delete-<resource>.handler.spec.ts
  queries/
    get-<resource>.query.ts
    get-<resources>.query.ts
    handlers/
      index.ts
      get-<resource>.handler.ts
      get-<resource>.handler.spec.ts
      get-<resources>.handler.ts
      get-<resources>.handler.spec.ts
  dto/
    create-<resource>.dto.ts
    update-<resource>.dto.ts
  entities/
    <resource>.entity.ts
  repositories/
    <resource>.repository.ts
```

## Procedure

### 1. Gather Requirements

Ask the user:
- **Resource name** (singular, PascalCase: e.g., "Project", "Organization")
- **Entity fields** with types and validation rules
  - Example: `{ name: string (required), description: string (optional), isActive: boolean (default: true) }`
- **Unique constraints** (if any beyond id)
- **Relations** to other entities (future: FK setup)

### 2. Create Entity

File: `api/src/<resource>/entities/<resource>.entity.ts`

**Critical patterns:**
- Extend `BaseEntity` (provides `id`, `createdAt`, `updatedAt`)
- Use `@Column()` + `@ApiProperty()` on every field
- Never manually add `@PrimaryGeneratedColumn()` or `@ObjectIdColumn()` — `BaseEntity` handles this via `@UnifiedId()`
- `@Entity()` decorator required

See [template](./templates/entity.template.ts).

### 3. Create DTOs

**Create DTO**: `api/src/<resource>/dto/create-<resource>.dto.ts`
- Use `class-validator` decorators (`@IsString()`, `@IsNotEmpty()`, `@IsEmail()`, etc.)
- Add `@ApiProperty()` on every field
- No `id`, `createdAt`, `updatedAt` — these are auto-generated

**Update DTO**: `api/src/<resource>/dto/update-<resource>.dto.ts`
- Use `PartialType(CreateResourceDto)` from `@nestjs/swagger`
- All fields become optional automatically

See [create template](./templates/create-dto.template.ts) and [update template](./templates/update-dto.template.ts).

### 4. Create Repository

File: `api/src/<resource>/repositories/<resource>.repository.ts`

**Critical pattern:**
- Extend `BaseRepository<Resource>` from `api/src/common/repositories/base.repository.ts`
- Inject `Repository<Resource>` via `@InjectRepository(Resource)`
- Pass injected repository to `super()`
- Add custom query methods if needed (always use `this.findById(id)` for lookups)

See [template](./templates/repository.template.ts).

### 5. Create Commands

Generate three command files + handlers:

**Command structure:**
```typescript
export class CreateResourceCommand extends Command<Resource> {
  constructor(public readonly dto: CreateResourceDto) {
    super()
  }
}
```

**Handler patterns:**
- `@CommandHandler(CommandClass)`
- Implement `ICommandHandler<Command, ReturnType>`
- Inject `ResourceRepository`
- **Create**: Return `Promise<Resource>`
- **Update/Delete**: Return `Promise<Resource | null>` (never throw from handlers)

See [command template](./templates/command.template.ts) and [handler template](./templates/command-handler.template.ts).

Create:
- `commands/create-<resource>.command.ts`
- `commands/update-<resource>.command.ts`
- `commands/delete-<resource>.command.ts`
- `commands/handlers/create-<resource>.handler.ts` + `.spec.ts`
- `commands/handlers/update-<resource>.handler.ts` + `.spec.ts`
- `commands/handlers/delete-<resource>.handler.ts` + `.spec.ts`
- `commands/handlers/index.ts` (export array)

### 6. Create Queries

Generate two query files + handlers:

**Query structure:**
```typescript
export class GetResourceQuery extends Query<Resource | null> {
  constructor(public readonly id: string) {
    super()
  }
}
```

**Handler patterns:**
- `@QueryHandler(QueryClass)`
- Implement `IQueryHandler<Query, ReturnType>`
- Inject `ResourceRepository`
- Use `repository.findById()` for single lookups
- Use `repository.find()` for list queries

See [query template](./templates/query.template.ts) and [handler template](./templates/query-handler.template.ts).

Create:
- `queries/get-<resource>.query.ts`
- `queries/get-<resources>.query.ts`
- `queries/handlers/get-<resource>.handler.ts` + `.spec.ts`
- `queries/handlers/get-<resources>.handler.ts` + `.spec.ts`
- `queries/handlers/index.ts` (export array)

### 7. Create Controller

File: `api/src/<resource>/<resource>.controller.ts`

**Critical patterns:**
- Inject `CommandBus` and `QueryBus`
- Use `@ApiTags('<resource-name>')` on class
- Use `@ApiOperation({ summary: '...' })` on every method
- Dispatch via `commandBus.execute()` and `queryBus.execute()`
- Check for `null` returns and throw `NotFoundException`
- Never throw from command/query handlers

**Standard endpoints:**
- `POST /` → Create (201)
- `GET /` → List all (200)
- `GET /:id` → Get one (200 or 404)
- `PATCH /:id` → Update (200 or 404)
- `DELETE /:id` → Delete (204 or 404)

See [controller template](./templates/controller.template.ts).

### 8. Create Controller Tests

File: `api/src/<resource>/<resource>.controller.spec.ts`

**Mock pattern:**
```typescript
const mockCommandBus = { execute: jest.fn() }
const mockQueryBus = { execute: jest.fn() }
```

Test all endpoints with success/failure cases.

See [controller test template](./templates/controller.spec.template.ts).

### 9. Create Handler Tests

For each command/query handler, create a `.spec.ts` file.

**Mock pattern:**
```typescript
const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
}
```

Test handler logic with mocked repository responses.

See [handler test template](./templates/handler.spec.template.ts).

### 10. Create Module

File: `api/src/<resource>/<resource>.module.ts`

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Resource])],
  controllers: [ResourceController],
  providers: [ResourceRepository, ...CommandHandlers, ...QueryHandlers],
})
export class ResourceModule {}
```

### 11. Register in AppModule

Add to `api/src/app.module.ts` imports:

```typescript
imports: [
  // ...existing imports
  ResourceModule,
]
```

### 12. Verify

Run these commands inside the API container (`task api:shell`):

```bash
pnpm test                    # Unit tests
pnpm test:e2e                # E2E tests
pnpm run lint                # Lint check
pnpm run format              # Format code
```

## Quality Checklist

Before finishing, verify:

- [ ] Entity extends `BaseEntity` (not direct `@PrimaryGeneratedColumn()`)
- [ ] All entity fields have `@Column()` + `@ApiProperty()`
- [ ] DTOs use `class-validator` + `@ApiProperty()`
- [ ] Update DTO uses `PartialType` from `@nestjs/swagger`
- [ ] Repository extends `BaseRepository<T>`
- [ ] Commands extend `Command<T>`, queries extend `Query<T>`
- [ ] Handlers implement proper interfaces with return types
- [ ] Update/delete handlers return `Type | null` (not throw)
- [ ] Controller checks for null and throws `NotFoundException`
- [ ] Controller has `@ApiTags()` and all methods have `@ApiOperation()`
- [ ] All handlers exported in `handlers/index.ts` barrel files
- [ ] Module registered in AppModule imports
- [ ] All tests create mocks with `useValue` pattern
- [ ] Import order follows ESLint rules (builtin → external → internal → parent → sibling → index)

## Reference Implementations

Explore the users module for working examples:
- [users.entity.ts](../../../api/src/users/entities/user.entity.ts)
- [users.controller.ts](../../../api/src/users/users.controller.ts)
- [create-user.handler.ts](../../../api/src/users/commands/handlers/create-user.handler.ts)
- [user.repository.ts](../../../api/src/users/repositories/user.repository.ts)

## Common Pitfalls

❌ **Using string IDs directly in queries** → Use `repository.findById(id)` to handle MongoDB ObjectId vs SQL integer conversion

❌ **Throwing from handlers** → Return `null` from update/delete handlers, let controllers throw

❌ **Forgetting `@ApiProperty()`** → Swagger docs will be incomplete

❌ **Not extending BaseEntity** → Missing `id`, `createdAt`, `updatedAt` fields and `@UnifiedId()` decorator

❌ **Using wrong PartialType** → Import from `@nestjs/swagger`, not `@nestjs/mapped-types` (loses API docs)

❌ **Mocking Repository<T> instead of CustomRepository** → Mock your repository class, not TypeORM's generic

## Advanced Patterns

### Adding Relations

When entities reference each other:
- Use `@ManyToOne()`, `@OneToMany()`, `@ManyToMany()`
- Add `eager: true` or manually join in queries
- Handle circular dependencies with `() => OtherEntity` callbacks

### Custom Query Methods

Add to repository:
```typescript
async findByEmail(email: string): Promise<User | null> {
  return this.repository.findOne({ where: { email } })
}
```

Create corresponding query + handler for CQRS pattern.

### Pagination

Add to list query:
```typescript
export class GetResourcesQuery extends Query<Resource[]> {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {
    super()
  }
}
```

Update handler to use TypeORM pagination.
