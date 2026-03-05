import { ObjectId } from 'mongodb'
import { EntityManager } from 'typeorm'
import { DatabaseType } from '../../config/database-type.enum'
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

    const firstCallArg = findOneSpy.mock.calls[0][0] as { where: { id: ObjectId } }
    expect(firstCallArg.where.id).toBeInstanceOf(ObjectId)
    expect(firstCallArg.where.id.toHexString()).toBe(id)
  })

  it('uses null id condition for MongoDB when id is invalid', async () => {
    const repository = new TestRepository(DatabaseType.MONGODB)
    const findOneSpy = jest.spyOn(repository, 'findOne').mockResolvedValue(null)

    await repository.findById('invalid-object-id')

    const firstCallArg = findOneSpy.mock.calls[0][0] as { where: { id: ObjectId | null } }
    expect(firstCallArg.where.id).toBeNull()
  })

  it('uses parsed number id condition for SQL databases when id is numeric', async () => {
    const repository = new TestRepository(DatabaseType.POSTGRES)
    const findOneSpy = jest.spyOn(repository, 'findOne').mockResolvedValue(null)

    await repository.findById('42')

    const firstCallArg = findOneSpy.mock.calls[0][0] as { where: { id: number | null } }
    expect(firstCallArg.where.id).toBe(42)
  })

  it('uses null id condition for SQL databases when id is not numeric', async () => {
    const repository = new TestRepository(DatabaseType.POSTGRES)
    const findOneSpy = jest.spyOn(repository, 'findOne').mockResolvedValue(null)

    await repository.findById('not-a-number')

    const firstCallArg = findOneSpy.mock.calls[0][0] as { where: { id: number | null } }
    expect(firstCallArg.where.id).toBeNull()
  })
})
