import { Test, TestingModule } from '@nestjs/testing'
import { CreateResourceHandler } from './create-resource.handler'
import { CreateResourceCommand } from '../create-resource.command'
import { ResourceRepository } from '../../repositories/resource.repository'
import { Resource } from '../../entities/resource.entity'

describe('CreateResourceHandler', () => {
  let handler: CreateResourceHandler
  let repository: ResourceRepository

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateResourceHandler,
        { provide: ResourceRepository, useValue: mockRepository },
      ],
    }).compile()

    handler = module.get<CreateResourceHandler>(CreateResourceHandler)
    repository = module.get<ResourceRepository>(ResourceRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create and save a resource', async () => {
    const dto = { name: 'Test Resource', isActive: true }
    const command = new CreateResourceCommand(dto)
    const newResource = { id: '1', ...dto } as Resource
    const savedResource = { ...newResource, createdAt: new Date(), updatedAt: new Date() }

    mockRepository.create.mockReturnValue(newResource)
    mockRepository.save.mockResolvedValue(savedResource)

    const result = await handler.execute(command)

    expect(repository.create).toHaveBeenCalledWith(dto)
    expect(repository.save).toHaveBeenCalledWith(newResource)
    expect(result).toEqual(savedResource)
  })
})
