import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ObjectId } from 'mongodb'
import { DataSource, FindOptionsWhere } from 'typeorm'
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto'
import { BaseRepository } from '../../common/repositories/base.repository'
import { DatabaseType, resolveDatabaseType } from '../../config/database-type.enum'
import { ProjectLocale } from '../entities/project-locale.entity'

@Injectable()
export class ProjectLocaleRepository extends BaseRepository<ProjectLocale> {
  constructor(dataSource: DataSource, configService: ConfigService) {
    super(ProjectLocale, dataSource.manager, resolveDatabaseType(configService.get<string>('LYA_DB_TYPE')))
  }

  createLocale(projectId: string, localeCode: string): ProjectLocale {
    if (this.dbType === DatabaseType.MONGODB) {
      return this.create({ projectId: new ObjectId(projectId), localeCode })
    }
    return this.create({ projectId: parseInt(projectId, 10), localeCode })
  }

  findLocale(projectId: string, localeCode: string): Promise<ProjectLocale | null> {
    if (this.dbType === DatabaseType.MONGODB) {
      try {
        const projectObjectId = new ObjectId(projectId)
        return this.manager
          .getMongoRepository(ProjectLocale)
          .findOne({ where: { projectId: projectObjectId, localeCode } as never })
      } catch {
        return Promise.resolve(null)
      }
    }

    const parsedProjectId = parseInt(projectId, 10)
    if (isNaN(parsedProjectId)) return Promise.resolve(null)
    return this.findOne({ where: { projectId: parsedProjectId, localeCode } as FindOptionsWhere<ProjectLocale> })
  }

  async findPaginatedByProjectId(
    projectId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResponseDto<ProjectLocale>> {
    if (this.dbType === DatabaseType.MONGODB) {
      try {
        const projectObjectId = new ObjectId(projectId)
        const mongoRepo = this.manager.getMongoRepository(ProjectLocale)
        const total = await mongoRepo.count({ projectId: projectObjectId })
        const data = await mongoRepo.find({
          where: { projectId: projectObjectId } as never,
          skip: (page - 1) * limit,
          take: limit,
          order: { addedAt: 'ASC' } as never,
        })
        return new PaginatedResponseDto(data, total, page, limit)
      } catch {
        return new PaginatedResponseDto([], 0, page, limit)
      }
    }

    const parsedProjectId = parseInt(projectId, 10)
    if (isNaN(parsedProjectId)) return new PaginatedResponseDto([], 0, page, limit)

    const [data, total] = await this.findAndCount({
      where: { projectId: parsedProjectId } as FindOptionsWhere<ProjectLocale>,
      skip: (page - 1) * limit,
      take: limit,
      order: { addedAt: 'ASC' },
    })
    return new PaginatedResponseDto(data, total, page, limit)
  }

  async deleteByProjectId(projectId: string): Promise<void> {
    if (this.dbType === DatabaseType.MONGODB) {
      try {
        const projectObjectId = new ObjectId(projectId)
        await this.manager.getMongoRepository(ProjectLocale).deleteMany({ projectId: projectObjectId })
      } catch {
        // invalid id, nothing to delete
      }
      return
    }

    const parsedProjectId = parseInt(projectId, 10)
    if (isNaN(parsedProjectId)) return
    await this.createQueryBuilder().delete().where('projectId = :id', { id: parsedProjectId }).execute()
  }
}
