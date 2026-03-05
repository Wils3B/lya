import { NotFoundException } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { Test, TestingModule } from '@nestjs/testing'
import { CreateResourceCommand } from './commands/create-resource.command'
import { DeleteResourceCommand } from './commands/delete-resource.command'
import { UpdateResourceCommand } from './commands/update-resource.command'
import { Resource } from './entities/resource.entity'
import { GetResourceQuery } from './queries/get-resource.query'
import { GetResourcesQuery } from './queries/get-resources.query'
import { ResourcesController } from './resources.controller'

describe('ResourcesController', () => {
  let controller: ResourcesController
  let commandBus: CommandBus
  let queryBus: QueryBus

  const mockCommandBus = {
    execute: jest.fn(),
  }

  const mockQueryBus = {
    execute: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourcesController],
      providers: [
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: QueryBus, useValue: mockQueryBus },
      ],
    }).compile()

    controller = module.get<ResourcesController>(ResourcesController)
    commandBus = module.get<CommandBus>(CommandBus)
    queryBus = module.get<QueryBus>(QueryBus)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create a resource', async () => {
      const dto = { name: 'Test Resource', isActive: true }
      const expectedResource = { id: '1', ...dto } as Resource

      mockCommandBus.execute.mockResolvedValue(expectedResource)

      const result = await controller.create(dto)

      expect(commandBus.execute).toHaveBeenCalledWith(new CreateResourceCommand(dto))
      expect(result).toEqual(expectedResource)
    })
  })

  describe('findAll', () => {
    it('should return an array of resources', async () => {
      const expectedResources = [{ id: '1', name: 'Resource 1' }] as Resource[]

      mockQueryBus.execute.mockResolvedValue(expectedResources)

      const result = await controller.findAll()

      expect(queryBus.execute).toHaveBeenCalledWith(new GetResourcesQuery())
      expect(result).toEqual(expectedResources)
    })
  })

  describe('findOne', () => {
    it('should return a resource by id', async () => {
      const expectedResource = { id: '1', name: 'Resource 1' } as Resource

      mockQueryBus.execute.mockResolvedValue(expectedResource)

      const result = await controller.findOne('1')

      expect(queryBus.execute).toHaveBeenCalledWith(new GetResourceQuery('1'))
      expect(result).toEqual(expectedResource)
    })

    it('should throw NotFoundException if resource not found', async () => {
      mockQueryBus.execute.mockResolvedValue(null)

      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('should update a resource', async () => {
      const dto = { name: 'Updated Resource' }
      const expectedResource = { id: '1', ...dto } as Resource

      mockCommandBus.execute.mockResolvedValue(expectedResource)

      const result = await controller.update('1', dto)

      expect(commandBus.execute).toHaveBeenCalledWith(new UpdateResourceCommand('1', dto))
      expect(result).toEqual(expectedResource)
    })

    it('should throw NotFoundException if resource not found', async () => {
      mockCommandBus.execute.mockResolvedValue(null)

      await expect(controller.update('1', {})).rejects.toThrow(NotFoundException)
    })
  })

  describe('remove', () => {
    it('should delete a resource', async () => {
      const expectedResource = { id: '1', name: 'Resource 1' } as Resource

      mockCommandBus.execute.mockResolvedValue(expectedResource)

      await controller.remove('1')

      expect(commandBus.execute).toHaveBeenCalledWith(new DeleteResourceCommand('1'))
    })

    it('should throw NotFoundException if resource not found', async () => {
      mockCommandBus.execute.mockResolvedValue(null)

      await expect(controller.remove('1')).rejects.toThrow(NotFoundException)
    })
  })
})
