import { ObjectId } from 'mongodb'
import { EntityManager, EntityTarget, FindOneOptions, FindOptionsWhere, Repository } from 'typeorm'
import { DatabaseType } from '../../config/database-type.enum'
import { BaseEntity } from '../entities/base.entity'

export abstract class BaseRepository<TEntity extends BaseEntity> extends Repository<TEntity> {
  protected constructor(
    target: EntityTarget<TEntity>,
    manager: EntityManager,
    private readonly dbType: DatabaseType
  ) {
    super(target, manager)
  }

  findById(id: string): Promise<TEntity | null> {
    return this.findOne(this.getWhereCondition(id))
  }

  private getWhereCondition(id: string): FindOneOptions<TEntity> {
    if (this.dbType === DatabaseType.MONGODB) {
      try {
        // TypeORM MongoDB does not map entity property names to DB column names in WHERE
        // conditions — must use the actual MongoDB field name '_id' directly.
        return { where: { _id: new ObjectId(id) } as unknown as FindOptionsWhere<TEntity> }
      } catch {
        return { where: { _id: null } as unknown as FindOptionsWhere<TEntity> }
      }
    }

    const parsedId = parseInt(id, 10)
    return {
      where: { id: (isNaN(parsedId) ? null : parsedId) as TEntity['id'] } as FindOptionsWhere<TEntity>,
    }
  }
}
