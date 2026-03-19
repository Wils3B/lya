import { ObjectId } from 'mongodb'
import { EntityManager } from 'typeorm'
import { DatabaseType } from '../../config/database-type.enum'
import { PaginatedResponseDto } from '../dto/paginated-response.dto'
import { BaseEntity } from '../entities/base.entity'
import { BaseRepository } from './base.repository'

class TestEntity extends BaseEntity {}

class TestRepository extends BaseRepository<TestEntity> {
  constructor(dbType: DatabaseType) {
    super(TestEntity, {} as EntityManager, dbType)
  }
}

describe('BaseRepository', () => {
  it('uses ObjectId condition for MongoDB when id is valid', async () => {
    const repository = new TestRepository(DatabaseType.MONGODB)
    const findOneSpy = jest.spyOn(repository, 'findOne').mockResolvedValue(null)
    const id = new ObjectId().toHexString()

    await repository.findById(id)

    const firstCallArg = findOneSpy.mock.calls[0][0] as { where: { _id: ObjectId } }
    expect(firstCallArg.where._id).toBeInstanceOf(ObjectId)
    expect(firstCallArg.where._id.toHexString()).toBe(id)
  })

  it('uses null id condition for MongoDB when id is invalid', async () => {
    const repository = new TestRepository(DatabaseType.MONGODB)
    const findOneSpy = jest.spyOn(repository, 'findOne').mockResolvedValue(null)

    await repository.findById('invalid-object-id')

    const firstCallArg = findOneSpy.mock.calls[0][0] as { where: { _id: ObjectId | null } }
    expect(firstCallArg.where._id).toBeNull()
  })

  it('uses parsed number id condition for SQL databases when id is numeric', async () => {
    const repository = new TestRepository(DatabaseType.POSTGRES)
    const findOneSpy = jest.spyOn(repository, 'findOne').mockResolvedValue(null)

    await repository.findById('42')

    const firstCallArg = findOneSpy.mock.calls[0][0] as { where: { id: number | null } }
    expect(firstCallArg.where.id).toBe(42)
  })

  it('uses -1 id condition for SQL databases when id is not numeric', async () => {
    const repository = new TestRepository(DatabaseType.POSTGRES)
    const findOneSpy = jest.spyOn(repository, 'findOne').mockResolvedValue(null)

    await repository.findById('not-a-number')

    const firstCallArg = findOneSpy.mock.calls[0][0] as { where: { id: number } }
    expect(firstCallArg.where.id).toBe(-1)
  })
})

describe('BaseRepository.findPaginated', () => {
  it('calls findAndCount with correct skip, take, and stable order', async () => {
    const repository = new TestRepository(DatabaseType.POSTGRES)
    const items = [{ id: 1 }, { id: 2 }] as TestEntity[]
    const findAndCountSpy = jest.spyOn(repository, 'findAndCount').mockResolvedValue([items, 10])

    await repository.findPaginated(2, 5)

    expect(findAndCountSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
        order: expect.objectContaining({ createdAt: 'DESC', id: 'DESC' }),
      })
    )
  })

  it('returns a PaginatedResponseDto with correct shape', async () => {
    const repository = new TestRepository(DatabaseType.POSTGRES)
    const items = [{ id: 1 }, { id: 2 }] as TestEntity[]
    jest.spyOn(repository, 'findAndCount').mockResolvedValue([items, 10])

    const result = await repository.findPaginated(2, 5)

    expect(result).toBeInstanceOf(PaginatedResponseDto)
    expect(result.data).toEqual(items)
    expect(result.total).toBe(10)
    expect(result.page).toBe(2)
    expect(result.limit).toBe(5)
    expect(result.totalPages).toBe(2)
  })
})
