import { ObjectId } from 'mongodb'
import { EntityManager, EntityTarget, FindOneOptions, FindOptionsWhere, Repository } from 'typeorm'
import { DatabaseType } from '../../config/database-type.enum'
import { PaginatedResponseDto } from '../dto/paginated-response.dto'
import { BaseEntity } from '../entities/base.entity'

export abstract class BaseRepository<TEntity extends BaseEntity> extends Repository<TEntity> {
  protected constructor(
    target: EntityTarget<TEntity>,
    manager: EntityManager,
    protected readonly dbType: DatabaseType
  ) {
    super(target, manager)
  }

  findById(id: string): Promise<TEntity | null> {
    return this.findOne(this.getWhereCondition(id))
  }

  async findPaginated(page: number, limit: number): Promise<PaginatedResponseDto<TEntity>> {
    const [data, total] = await this.findAndCount({ skip: (page - 1) * limit, take: limit })
    return new PaginatedResponseDto(data, total, page, limit)
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
    // Use -1 (never a valid auto-increment ID) rather than null; TypeORM silently
    // ignores null WHERE values and would return the first row instead of no rows.
    return {
      where: { id: (isNaN(parsedId) ? -1 : parsedId) as TEntity['id'] } as FindOptionsWhere<TEntity>,
    }
  }
}
