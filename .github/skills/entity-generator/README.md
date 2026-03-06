# Entity Generator Skill

Generate complete NestJS CQRS resource modules with multi-database support for the lya platform.

## What It Does

Scaffolds a full CRUD module following lya's architecture:
- **CQRS pattern** with commands and queries
- **Multi-database support** (PostgreSQL, MySQL, MariaDB, MongoDB, SQLite)
- **TypeORM entities** extending BaseEntity
- **DTOs** with validation
- **Repository pattern** for database-agnostic operations
- **Controller** with Swagger documentation
- **Comprehensive tests** (unit + controller specs)

## Usage

### Via Slash Command

Type `/entity-generator` in Copilot Chat and provide the resource name.

### Via Natural Language

"Create a new Project entity with name, code, and description fields using CQRS pattern"

"Generate a Translation resource with assetKey, locale, value, and status"

## What You'll Be Asked

1. **Resource name** (singular, PascalCase) — e.g., "Project", "Organization"
2. **Entity fields** with types and validation:
   - Field names and types (string, number, boolean, Date)
   - Required vs optional
   - Default values
   - Validation rules (email, min/max length, etc.)
3. **Unique constraints** (if any beyond id)

## Generated Structure

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

## Key Conventions Enforced

✅ Entity extends `BaseEntity` (auto-includes id, createdAt, updatedAt)
✅ `@Column()` + `@ApiProperty()` on all entity fields
✅ DTOs use class-validator + `@ApiProperty()`
✅ Update DTO uses `PartialType` from `@nestjs/swagger`
✅ Repository extends `BaseRepository<T>` for multi-DB support
✅ Commands/queries extend proper base classes with type parameters
✅ Handlers return `T | null` for update/delete (controllers throw exceptions)
✅ Controller has `@ApiTags()` and `@ApiOperation()` on all methods
✅ Proper import order (ESLint compliant)

## Example Session

```
User: /entity-generator Project

Agent: I'll help you create a Project entity. What fields should it have?

User: name (string, required), code (string, required, unique), 
      description (string, optional), isActive (boolean, default true)

Agent: [Generates complete module with CQRS pattern]
      
      Created:
      - api/src/projects/entities/project.entity.ts
      - api/src/projects/dto/create-project.dto.ts
      - api/src/projects/dto/update-project.dto.ts
      - api/src/projects/repositories/project.repository.ts
      - [commands and handlers]
      - [queries and handlers]
      - api/src/projects/projects.controller.ts
      - api/src/projects/projects.module.ts
      
      Registered ProjectsModule in AppModule.
      
      Run `task api:shell` then `pnpm test` to verify.
```

## Templates

All templates are in `templates/` and reference the Users module implementation as the canonical example.

## Verification

After generation, the skill runs a quality checklist to ensure:
- All files follow naming conventions
- Import order is correct
- Tests are properly mocked
- Module is registered in AppModule
- No TypeScript or ESLint errors

## Related

- See [copilot-instructions.md](../../../copilot-instructions.md) for full architecture docs
- Reference implementation: [api/src/users/](../../../api/src/users/)
