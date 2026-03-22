import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ObjectId } from 'mongodb'
import { DataSource, FindOptionsWhere } from 'typeorm'
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto'
import { BaseRepository } from '../../common/repositories/base.repository'
import { DatabaseType, resolveDatabaseType } from '../../config/database-type.enum'
import { Project } from '../entities/project.entity'

@Injectable()
export class ProjectRepository extends BaseRepository<Project> {
  constructor(dataSource: DataSource, configService: ConfigService) {
    super(Project, dataSource.manager, resolveDatabaseType(configService.get<string>('LYA_DB_TYPE')))
  }

  createProject(organisationId: string, name: string, slug: string, description: string | null): Project {
    if (this.dbType === DatabaseType.MONGODB) {
      return this.create({ organisationId: new ObjectId(organisationId), name, slug, description })
    }
    return this.create({ organisationId: parseInt(organisationId, 10), name, slug, description })
  }

  findBySlug(organisationId: string, slug: string): Promise<Project | null> {
    if (this.dbType === DatabaseType.MONGODB) {
      try {
        const orgObjectId = new ObjectId(organisationId)
        return this.manager
          .getMongoRepository(Project)
          .findOne({ where: { organisationId: orgObjectId, slug } as never })
      } catch {
        return Promise.resolve(null)
      }
    }

    const parsedOrgId = parseInt(organisationId, 10)
    if (isNaN(parsedOrgId)) return Promise.resolve(null)
    return this.findOne({ where: { organisationId: parsedOrgId, slug } as FindOptionsWhere<Project> })
  }

  async findPaginatedByOrganisationId(
    organisationId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResponseDto<Project>> {
    if (this.dbType === DatabaseType.MONGODB) {
      try {
        const orgObjectId = new ObjectId(organisationId)
        const mongoRepo = this.manager.getMongoRepository(Project)
        const total = await mongoRepo.count({ organisationId: orgObjectId })
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
      where: { organisationId: parsedOrgId } as FindOptionsWhere<Project>,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    })
    return new PaginatedResponseDto(data, total, page, limit)
  }

  async findPaginatedByProjectIds(
    projectIds: (number | ObjectId)[],
    page: number,
    limit: number
  ): Promise<PaginatedResponseDto<Project>> {
    if (projectIds.length === 0) return new PaginatedResponseDto([], 0, page, limit)

    if (this.dbType === DatabaseType.MONGODB) {
      const objectIds = projectIds.map((id) => (id instanceof ObjectId ? id : new ObjectId(String(id))))
      const mongoRepo = this.manager.getMongoRepository(Project)
      const total = await mongoRepo.count({ _id: { $in: objectIds } } as never)
      const data = await mongoRepo.find({
        where: { _id: { $in: objectIds } } as never,
        skip: (page - 1) * limit,
        take: limit,
      })
      return new PaginatedResponseDto(data, total, page, limit)
    }

    const numericIds = projectIds.map((id) => (typeof id === 'number' ? id : parseInt(String(id), 10)))
    const [data, total] = await this.manager.connection
      .createQueryBuilder(Project, 'project')
      .where('project.id IN (:...ids)', { ids: numericIds })
      .orderBy('project.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()
    return new PaginatedResponseDto(data, total, page, limit)
  }

  async deleteByOrganisationId(organisationId: string): Promise<void> {
    if (this.dbType === DatabaseType.MONGODB) {
      try {
        const orgObjectId = new ObjectId(organisationId)
        await this.manager.getMongoRepository(Project).deleteMany({ organisationId: orgObjectId })
      } catch {
        // invalid id, nothing to delete
      }
      return
    }

    const parsedOrgId = parseInt(organisationId, 10)
    if (isNaN(parsedOrgId)) return
    await this.createQueryBuilder().delete().where('organisationId = :id', { id: parsedOrgId }).execute()
  }
}
