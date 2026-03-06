import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateResourceCommand } from './commands/create-resource.command'
import { DeleteResourceCommand } from './commands/delete-resource.command'
import { UpdateResourceCommand } from './commands/update-resource.command'
import { CreateResourceDto } from './dto/create-resource.dto'
import { UpdateResourceDto } from './dto/update-resource.dto'
import { Resource } from './entities/resource.entity'
import { GetResourceQuery } from './queries/get-resource.query'
import { GetResourcesQuery } from './queries/get-resources.query'

@ApiTags('resources')
@Controller('resources')
export class ResourcesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new resource' })
  async create(@Body() createResourceDto: CreateResourceDto): Promise<Resource> {
    return this.commandBus.execute(new CreateResourceCommand(createResourceDto))
  }

  @Get()
  @ApiOperation({ summary: 'Get all resources' })
  async findAll(): Promise<Resource[]> {
    return this.queryBus.execute(new GetResourcesQuery())
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a resource by id' })
  async findOne(@Param('id') id: string): Promise<Resource> {
    const resource = await this.queryBus.execute(new GetResourceQuery(id))
    if (!resource) {
      throw new NotFoundException(`Resource with id ${id} not found`)
    }
    return resource
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a resource' })
  async update(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ): Promise<Resource> {
    const resource = await this.commandBus.execute(new UpdateResourceCommand(id, updateResourceDto))
    if (!resource) {
      throw new NotFoundException(`Resource with id ${id} not found`)
    }
    return resource
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a resource' })
  async remove(@Param('id') id: string): Promise<void> {
    const resource = await this.commandBus.execute(new DeleteResourceCommand(id))
    if (!resource) {
      throw new NotFoundException(`Resource with id ${id} not found`)
    }
  }
}
