import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto'
import { PaginationQueryDto } from '../common/dto/pagination-query.dto'
import { CreateUserCommand, DeleteUserCommand, UpdateUserCommand } from './commands'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'
import { GetUserQuery, GetUsersQuery } from './queries'

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @ApiOperation({ summary: 'Create a new user' })
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.commandBus.execute<User>(new CreateUserCommand(createUserDto))
  }

  @ApiOperation({ summary: 'Get paginated users' })
  @Get()
  findMany(@Query() { page, limit }: PaginationQueryDto): Promise<PaginatedResponseDto<User>> {
    return this.queryBus.execute<PaginatedResponseDto<User>>(new GetUsersQuery(page, limit))
  }

  @ApiOperation({ summary: 'Get a user by id' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.queryBus.execute<User | null>(new GetUserQuery(id))
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return user
  }

  @ApiOperation({ summary: 'Update a user' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.commandBus.execute<User | null>(new UpdateUserCommand(id, updateUserDto))
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return user
  }

  @ApiOperation({ summary: 'Delete a user' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<User> {
    const user = await this.commandBus.execute<User | null>(new DeleteUserCommand(id))
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return user
  }
}
