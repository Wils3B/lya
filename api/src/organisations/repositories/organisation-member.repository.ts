import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ObjectId } from 'mongodb'
import { DataSource, FindOptionsWhere } from 'typeorm'
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto'
import { BaseRepository } from '../../common/repositories/base.repository'
import { DatabaseType, resolveDatabaseType } from '../../config/database-type.enum'
import { OrganisationMember, OrganisationRole } from '../entities/organisation-member.entity'

@Injectable()
export class OrganisationMemberRepository extends BaseRepository<OrganisationMember> {
  constructor(dataSource: DataSource, configService: ConfigService) {
    super(OrganisationMember, dataSource.manager, resolveDatabaseType(configService.get<string>('LYA_DB_TYPE')))
  }

  createMembership(organisationId: string, userId: string, role: OrganisationRole): OrganisationMember {
    if (this.dbType === DatabaseType.MONGODB) {
      return this.create({
        organisationId: new ObjectId(organisationId) as unknown as number,
        userId: new ObjectId(userId) as unknown as number,
        role,
      })
    }
    return this.create({
      organisationId: parseInt(organisationId, 10) as unknown as number,
      userId: parseInt(userId, 10) as unknown as number,
      role,
    })
  }

  findMembership(organisationId: string, userId: string): Promise<OrganisationMember | null> {
    if (this.dbType === DatabaseType.MONGODB) {
      try {
        const orgObjectId = new ObjectId(organisationId)
        const userObjectId = new ObjectId(userId)
        return this.manager
          .getMongoRepository(OrganisationMember)
          .findOne({ where: { organisationId: orgObjectId, userId: userObjectId } as never })
      } catch {
        return Promise.resolve(null)
      }
    }

    const parsedOrgId = parseInt(organisationId, 10)
    const parsedUserId = parseInt(userId, 10)
    if (isNaN(parsedOrgId) || isNaN(parsedUserId)) return Promise.resolve(null)

    return this.findOne({
      where: {
        organisationId: parsedOrgId,
        userId: parsedUserId,
      } as unknown as FindOptionsWhere<OrganisationMember>,
    })
  }

  async findPaginatedByOrgId(
    organisationId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResponseDto<OrganisationMember>> {
    if (this.dbType === DatabaseType.MONGODB) {
      try {
        const orgObjectId = new ObjectId(organisationId)
        const mongoRepo = this.manager.getMongoRepository(OrganisationMember)
        const total = await mongoRepo.count({ where: { organisationId: orgObjectId } as never })
        const data = await mongoRepo.find({
          where: { organisationId: orgObjectId } as never,
          skip: (page - 1) * limit,
          take: limit,
        })
        return new PaginatedResponseDto(data, total, page, limit)
      } catch {
        return new PaginatedResponseDto([], 0, page, limit)
      }
    }

    const parsedOrgId = parseInt(organisationId, 10)
    if (isNaN(parsedOrgId)) return new PaginatedResponseDto([], 0, page, limit)

    const [data, total] = await this.findAndCount({
      where: { organisationId: parsedOrgId } as unknown as FindOptionsWhere<OrganisationMember>,
      skip: (page - 1) * limit,
      take: limit,
      order: { joinedAt: 'ASC' } as Parameters<typeof this.findAndCount>[0]['order'],
    })
    return new PaginatedResponseDto(data, total, page, limit)
  }

  async deleteByOrganisationId(organisationId: string): Promise<void> {
    if (this.dbType === DatabaseType.MONGODB) {
      try {
        const orgObjectId = new ObjectId(organisationId)
        await this.manager.getMongoRepository(OrganisationMember).deleteMany({ organisationId: orgObjectId })
      } catch {
        // invalid id, nothing to delete
      }
      return
    }

    const parsedOrgId = parseInt(organisationId, 10)
    if (isNaN(parsedOrgId)) return
    await this.createQueryBuilder().delete().where('organisationId = :id', { id: parsedOrgId }).execute()
  }

  async countOwnersByOrgId(organisationId: string): Promise<number> {
    if (this.dbType === DatabaseType.MONGODB) {
      try {
        const orgObjectId = new ObjectId(organisationId)
        return this.manager.getMongoRepository(OrganisationMember).count({
          where: { organisationId: orgObjectId, role: 'owner' } as never,
        })
      } catch {
        return 0
      }
    }

    const parsedOrgId = parseInt(organisationId, 10)
    if (isNaN(parsedOrgId)) return 0

    return this.count({
      where: {
        organisationId: parsedOrgId,
        role: 'owner',
      } as unknown as FindOptionsWhere<OrganisationMember>,
    })
  }
}
