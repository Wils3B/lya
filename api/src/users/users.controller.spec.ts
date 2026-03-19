import { NotFoundException } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { Test, TestingModule } from '@nestjs/testing'
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto'
import { PaginationQueryDto } from '../common/dto/pagination-query.dto'
import { CreateUserCommand, DeleteUserCommand, UpdateUserCommand } from './commands'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'
import { GetUserQuery, GetUsersQuery } from './queries'
import { UsersController } from './users.controller'

describe('UsersController', () => {
  let controller: UsersController
  let commandBus: { execute: jest.Mock }
  let queryBus: { execute: jest.Mock }

  beforeEach(async () => {
    commandBus = { execute: jest.fn() }
    queryBus = { execute: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: CommandBus, useValue: commandBus },
        { provide: QueryBus, useValue: queryBus },
      ],
    }).compile()

    controller = module.get<UsersController>(UsersController)
  })

  it('creates a user via command bus', async () => {
    const dto: CreateUserDto = { name: 'Alice', email: 'alice@example.com', password: 'password123' }
    const result = { id: 1, ...dto }
    commandBus.execute.mockResolvedValue(result)

    const response = await controller.create(dto)

    expect(commandBus.execute).toHaveBeenCalledWith(expect.any(CreateUserCommand))
    expect(response).toEqual(result)
  })

  it('gets paginated users via query bus', async () => {
    const users = [{ id: 1, name: 'Alice', email: 'alice@example.com' }] as User[]
    const result = new PaginatedResponseDto(users, 1, 1, 20)
    queryBus.execute.mockResolvedValue(result)
    const pagination: PaginationQueryDto = { page: 1, limit: 20 }

    const response = await controller.findMany(pagination)

    expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetUsersQuery))
    expect(response).toEqual(result)
  })

  it('gets one user via query bus', async () => {
    const result = { id: 1, name: 'Alice', email: 'alice@example.com' }
    queryBus.execute.mockResolvedValue(result)

    const response = await controller.findOne('1')

    expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetUserQuery))
    expect(response).toEqual(result)
  })

  it('throws NotFoundException when user is not found on get by id', async () => {
    queryBus.execute.mockResolvedValue(null)

    await expect(controller.findOne('404')).rejects.toThrow(NotFoundException)
  })

  it('updates a user via command bus', async () => {
    const dto: UpdateUserDto = { name: 'Bob' }
    const result = { id: 1, name: 'Bob', email: 'alice@example.com' }
    commandBus.execute.mockResolvedValue(result)

    const response = await controller.update('1', dto)

    expect(commandBus.execute).toHaveBeenCalledWith(expect.any(UpdateUserCommand))
    expect(response).toEqual(result)
  })

  it('throws NotFoundException when user is not found on update', async () => {
    commandBus.execute.mockResolvedValue(null)

    await expect(controller.update('404', { name: 'Bob' })).rejects.toThrow(NotFoundException)
  })

  it('deletes a user via command bus', async () => {
    const result = { id: 1, name: 'Alice', email: 'alice@example.com' }
    commandBus.execute.mockResolvedValue(result)

    const response = await controller.remove('1')

    expect(commandBus.execute).toHaveBeenCalledWith(expect.any(DeleteUserCommand))
    expect(response).toEqual(result)
  })

  it('throws NotFoundException when user is not found on delete', async () => {
    commandBus.execute.mockResolvedValue(null)

    await expect(controller.remove('404')).rejects.toThrow(NotFoundException)
  })
})
