# Entity Generator — File Templates

All templates use these placeholders — replace with real names before writing files:

| Placeholder | Form | Example |
|---|---|---|
| `{Entity}` | PascalCase singular | `Project` |
| `{entity}` | camelCase singular | `project` |
| `{Entities}` | PascalCase plural | `Projects` |
| `{entities}` | camelCase plural | `projects` |
| `{entity-kebab}` | kebab-case singular | `project` |
| `{entities-kebab}` | kebab-case plural | `projects` |

---

## Entity

```typescript
// api/src/{entities-kebab}/entities/{entity-kebab}.entity.ts
import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'

@Entity()
export class {Entity} extends BaseEntity {
  @Column()
  @ApiProperty()
  name: string
}
```

---

## DTOs

```typescript
// api/src/{entities-kebab}/dto/create-{entity-kebab}.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class Create{Entity}Dto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string
}
```

```typescript
// api/src/{entities-kebab}/dto/update-{entity-kebab}.dto.ts
import { PartialType } from '@nestjs/swagger'
import { Create{Entity}Dto } from './create-{entity-kebab}.dto'

export class Update{Entity}Dto extends PartialType(Create{Entity}Dto) {}
```

---

## Repository

```typescript
// api/src/{entities-kebab}/repositories/{entity-kebab}.repository.ts
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DataSource } from 'typeorm'
import { BaseRepository } from '../../common/repositories/base.repository'
import { resolveDatabaseType } from '../../config/database-type.enum'
import { {Entity} } from '../entities/{entity-kebab}.entity'

@Injectable()
export class {Entity}Repository extends BaseRepository<{Entity}> {
  constructor(dataSource: DataSource, configService: ConfigService) {
    super({Entity}, dataSource.manager, resolveDatabaseType(configService.get<string>('LYA_DB_TYPE')))
  }
}
```

---

## Commands

```typescript
// api/src/{entities-kebab}/commands/create-{entity-kebab}.command.ts
import { Command } from '@nestjs/cqrs'
import { Create{Entity}Dto } from '../dto/create-{entity-kebab}.dto'
import { {Entity} } from '../entities/{entity-kebab}.entity'

export class Create{Entity}Command extends Command<{Entity}> {
  constructor(public readonly payload: Create{Entity}Dto) {
    super()
  }
}
```

```typescript
// api/src/{entities-kebab}/commands/update-{entity-kebab}.command.ts
import { Command } from '@nestjs/cqrs'
import { Update{Entity}Dto } from '../dto/update-{entity-kebab}.dto'
import { {Entity} } from '../entities/{entity-kebab}.entity'

export class Update{Entity}Command extends Command<{Entity} | null> {
  constructor(
    public readonly id: string,
    public readonly payload: Update{Entity}Dto
  ) {
    super()
  }
}
```

```typescript
// api/src/{entities-kebab}/commands/delete-{entity-kebab}.command.ts
import { Command } from '@nestjs/cqrs'
import { {Entity} } from '../entities/{entity-kebab}.entity'

export class Delete{Entity}Command extends Command<{Entity} | null> {
  constructor(public readonly id: string) {
    super()
  }
}
```

```typescript
// api/src/{entities-kebab}/commands/index.ts
export * from './create-{entity-kebab}.command'
export * from './delete-{entity-kebab}.command'
export * from './update-{entity-kebab}.command'
```

---

## Command Handlers

```typescript
// api/src/{entities-kebab}/commands/handlers/create-{entity-kebab}.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { {Entity} } from '../../entities/{entity-kebab}.entity'
import { {Entity}Repository } from '../../repositories/{entity-kebab}.repository'
import { Create{Entity}Command } from '../create-{entity-kebab}.command'

@CommandHandler(Create{Entity}Command)
export class Create{Entity}Handler implements ICommandHandler<Create{Entity}Command, {Entity}> {
  constructor(private readonly repository: {Entity}Repository) {}

  execute(command: Create{Entity}Command): Promise<{Entity}> {
    const entity = this.repository.create(command.payload)
    return this.repository.save(entity)
  }
}
```

```typescript
// api/src/{entities-kebab}/commands/handlers/update-{entity-kebab}.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { {Entity} } from '../../entities/{entity-kebab}.entity'
import { {Entity}Repository } from '../../repositories/{entity-kebab}.repository'
import { Update{Entity}Command } from '../update-{entity-kebab}.command'

@CommandHandler(Update{Entity}Command)
export class Update{Entity}Handler implements ICommandHandler<Update{Entity}Command, {Entity} | null> {
  constructor(private readonly repository: {Entity}Repository) {}

  async execute(command: Update{Entity}Command): Promise<{Entity} | null> {
    const entity = await this.repository.findById(command.id)
    if (!entity) return null
    Object.assign(entity, command.payload)
    return this.repository.save(entity)
  }
}
```

```typescript
// api/src/{entities-kebab}/commands/handlers/delete-{entity-kebab}.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { {Entity} } from '../../entities/{entity-kebab}.entity'
import { {Entity}Repository } from '../../repositories/{entity-kebab}.repository'
import { Delete{Entity}Command } from '../delete-{entity-kebab}.command'

@CommandHandler(Delete{Entity}Command)
export class Delete{Entity}Handler implements ICommandHandler<Delete{Entity}Command, {Entity} | null> {
  constructor(private readonly repository: {Entity}Repository) {}

  async execute(command: Delete{Entity}Command): Promise<{Entity} | null> {
    const entity = await this.repository.findById(command.id)
    if (!entity) return null
    return this.repository.remove(entity)
  }
}
```

```typescript
// api/src/{entities-kebab}/commands/handlers/index.ts
import { Provider } from '@nestjs/common'
import { Create{Entity}Handler } from './create-{entity-kebab}.handler'
import { Delete{Entity}Handler } from './delete-{entity-kebab}.handler'
import { Update{Entity}Handler } from './update-{entity-kebab}.handler'

export const CommandHandlers: Provider[] = [Create{Entity}Handler, Delete{Entity}Handler, Update{Entity}Handler]
```

---

## Queries

```typescript
// api/src/{entities-kebab}/queries/get-{entity-kebab}.query.ts
import { Query } from '@nestjs/cqrs'
import { {Entity} } from '../entities/{entity-kebab}.entity'

export class Get{Entity}Query extends Query<{Entity} | null> {
  constructor(public readonly id: string) {
    super()
  }
}
```

```typescript
// api/src/{entities-kebab}/queries/get-{entities-kebab}.query.ts
import { Query } from '@nestjs/cqrs'
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto'
import { {Entity} } from '../entities/{entity-kebab}.entity'

export class Get{Entities}Query extends Query<PaginatedResponseDto<{Entity}>> {
  constructor(
    public readonly page: number,
    public readonly limit: number
  ) {
    super()
  }
}
```

```typescript
// api/src/{entities-kebab}/queries/index.ts
export * from './get-{entity-kebab}.query'
export * from './get-{entities-kebab}.query'
```

---

## Query Handlers

```typescript
// api/src/{entities-kebab}/queries/handlers/get-{entity-kebab}.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { {Entity} } from '../../entities/{entity-kebab}.entity'
import { {Entity}Repository } from '../../repositories/{entity-kebab}.repository'
import { Get{Entity}Query } from '../get-{entity-kebab}.query'

@QueryHandler(Get{Entity}Query)
export class Get{Entity}Handler implements IQueryHandler<Get{Entity}Query, {Entity} | null> {
  constructor(private readonly repository: {Entity}Repository) {}

  execute(query: Get{Entity}Query): Promise<{Entity} | null> {
    return this.repository.findById(query.id)
  }
}
```

```typescript
// api/src/{entities-kebab}/queries/handlers/get-{entities-kebab}.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto'
import { {Entity} } from '../../entities/{entity-kebab}.entity'
import { {Entity}Repository } from '../../repositories/{entity-kebab}.repository'
import { Get{Entities}Query } from '../get-{entities-kebab}.query'

@QueryHandler(Get{Entities}Query)
export class Get{Entities}Handler implements IQueryHandler<Get{Entities}Query, PaginatedResponseDto<{Entity}>> {
  constructor(private readonly repository: {Entity}Repository) {}

  execute(query: Get{Entities}Query): Promise<PaginatedResponseDto<{Entity}>> {
    return this.repository.findPaginated(query.page, query.limit)
  }
}
```

```typescript
// api/src/{entities-kebab}/queries/handlers/index.ts
import { Provider } from '@nestjs/common'
import { Get{Entity}Handler } from './get-{entity-kebab}.handler'
import { Get{Entities}Handler } from './get-{entities-kebab}.handler'

export const QueryHandlers: Provider[] = [Get{Entity}Handler, Get{Entities}Handler]
```

---

## Controller

```typescript
// api/src/{entities-kebab}/{entity-kebab}.controller.ts
import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto'
import { PaginationQueryDto } from '../common/dto/pagination-query.dto'
import { Create{Entity}Command, Delete{Entity}Command, Update{Entity}Command } from './commands'
import { Create{Entity}Dto } from './dto/create-{entity-kebab}.dto'
import { Update{Entity}Dto } from './dto/update-{entity-kebab}.dto'
import { {Entity} } from './entities/{entity-kebab}.entity'
import { Get{Entity}Query, Get{Entities}Query } from './queries'

@ApiTags('{entities-kebab}')
@Controller('{entities-kebab}')
export class {Entity}Controller {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @ApiOperation({ summary: 'Create a new {entity}' })
  @Post()
  create(@Body() dto: Create{Entity}Dto): Promise<{Entity}> {
    return this.commandBus.execute<{Entity}>(new Create{Entity}Command(dto))
  }

  @ApiOperation({ summary: 'Get paginated {entities}' })
  @Get()
  findMany(@Query() { page, limit }: PaginationQueryDto): Promise<PaginatedResponseDto<{Entity}>> {
    return this.queryBus.execute<PaginatedResponseDto<{Entity}>>(new Get{Entities}Query(page, limit))
  }

  @ApiOperation({ summary: 'Get a {entity} by id' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<{Entity}> {
    const entity = await this.queryBus.execute<{Entity} | null>(new Get{Entity}Query(id))
    if (!entity) throw new NotFoundException(`{Entity} with ID ${id} not found`)
    return entity
  }

  @ApiOperation({ summary: 'Update a {entity}' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Update{Entity}Dto): Promise<{Entity}> {
    const entity = await this.commandBus.execute<{Entity} | null>(new Update{Entity}Command(id, dto))
    if (!entity) throw new NotFoundException(`{Entity} with ID ${id} not found`)
    return entity
  }

  @ApiOperation({ summary: 'Delete a {entity}' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{Entity}> {
    const entity = await this.commandBus.execute<{Entity} | null>(new Delete{Entity}Command(id))
    if (!entity) throw new NotFoundException(`{Entity} with ID ${id} not found`)
    return entity
  }
}
```

---

## Module

```typescript
// api/src/{entities-kebab}/{entity-kebab}.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommandHandlers } from './commands/handlers'
import { {Entity} } from './entities/{entity-kebab}.entity'
import { QueryHandlers } from './queries/handlers'
import { {Entity}Repository } from './repositories/{entity-kebab}.repository'
import { {Entity}Controller } from './{entity-kebab}.controller'

@Module({
  imports: [TypeOrmModule.forFeature([{Entity}])],
  controllers: [{Entity}Controller],
  providers: [{Entity}Repository, ...CommandHandlers, ...QueryHandlers],
})
export class {Entity}Module {}
```