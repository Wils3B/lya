import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ObjectId } from 'mongodb'
import { DataSource, FindOptionsWhere, In } from 'typeorm'
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto'
import { BaseRepository } from '../../common/repositories/base.repository'
import { DatabaseType, resolveDatabaseType } from '../../config/database-type.enum'
import { Organisation } from '../entities/organisation.entity'

@Injectable()
export class OrganisationRepository extends BaseRepository<Organisation> {
  constructor(dataSource: DataSource, configService: ConfigService) {
    super(Organisation, dataSource.manager, resolveDatabaseType(configService.get<string>('LYA_DB_TYPE')))
  }

  findBySlug(slug: string): Promise<Organisation | null> {
    return this.findOne({ where: { slug } as FindOptionsWhere<Organisation> })
  }

  findByIdOrSlug(identifier: string): Promise<Organisation | null> {
    if (this.dbType === DatabaseType.MONGODB) {
      try {
        return this.manager
          .getMongoRepository(Organisation)
          .findOne({ where: { _id: new ObjectId(identifier) } as never })
      } catch {
        return this.manager.getMongoRepository(Organisation).findOne({ where: { slug: identifier } as never })
      }
    }

    const parsedId = parseInt(identifier, 10)
    if (!isNaN(parsedId)) {
      return this.findOne({ where: { id: parsedId } as FindOptionsWhere<Organisation> })
    }
    return this.findOne({ where: { slug: identifier } as FindOptionsWhere<Organisation> })
  }

  async findPaginatedByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResponseDto<Organisation>> {
    if (this.dbType === DatabaseType.MONGODB) {
      return this.findPaginatedByUserIdMongo(userId, page, limit)
    }

    const parsedUserId = parseInt(userId, 10)
    const safeUserId = isNaN(parsedUserId) ? -1 : parsedUserId
    const offset = (page - 1) * limit

    const [data, total] = await this.manager.connection
      .createQueryBuilder(Organisation, 'org')
      .innerJoin('organisation_member', 'member', 'member.organisationId = org.id')
      .where('member.userId = :userId', { userId: safeUserId })
      .orderBy('org.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount()

    return new PaginatedResponseDto(data, total, page, limit)
  }

  async findByIds(ids: (number | ObjectId)[]): Promise<Organisation[]> {
    if (ids.length === 0) return []

    if (this.dbType === DatabaseType.MONGODB) {
      const objectIds = ids.map((id) => (id instanceof ObjectId ? id : new ObjectId(String(id))))
      return this.manager.getMongoRepository(Organisation).find({ where: { _id: { $in: objectIds } } as never })
    }

    return this.find({ where: { id: In(ids) } as FindOptionsWhere<Organisation> })
  }

  private async findPaginatedByUserIdMongo(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResponseDto<Organisation>> {
    let userObjectId: ObjectId
    try {
      userObjectId = new ObjectId(userId)
    } catch {
      return new PaginatedResponseDto([], 0, page, limit)
    }

    const memberRepo = this.manager.getMongoRepository('organisation_member')
    const members = await memberRepo.find({ where: { userId: userObjectId } as never })
    const total = members.length
    const paged = members.slice((page - 1) * limit, page * limit)
    const orgIds = paged.map((m: { organisationId: ObjectId }) => m.organisationId)
    const orgs = await this.findByIds(orgIds)

    return new PaginatedResponseDto(orgs, total, page, limit)
  }
}
