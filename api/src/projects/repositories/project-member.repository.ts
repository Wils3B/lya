import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ObjectId } from 'mongodb'
import { DataSource, FindOptionsWhere } from 'typeorm'
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto'
import { BaseRepository } from '../../common/repositories/base.repository'
import { DatabaseType, resolveDatabaseType } from '../../config/database-type.enum'
import { ProjectMember } from '../entities/project-member.entity'
import { ProjectRole } from '../entities/project-role.enum'

@Injectable()
export class ProjectMemberRepository extends BaseRepository<ProjectMember> {
  constructor(dataSource: DataSource, configService: ConfigService) {
    super(ProjectMember, dataSource.manager, resolveDatabaseType(configService.get<string>('LYA_DB_TYPE')))
  }

  createMembership(projectId: string, userId: string, role: ProjectRole): ProjectMember {
    if (this.dbType === DatabaseType.MONGODB) {
      return this.create({
        projectId: new ObjectId(projectId),
        userId: new ObjectId(userId),
        role,
      })
    }
    return this.create({
      projectId: parseInt(projectId, 10),
      userId: parseInt(userId, 10),
      role,
    })
  }

  findMembership(projectId: string, userId: string): Promise<ProjectMember | null> {
    if (this.dbType === DatabaseType.MONGODB) {
      try {
        const projectObjectId = new ObjectId(projectId)
        const userObjectId = new ObjectId(userId)
        return this.manager
          .getMongoRepository(ProjectMember)
          .findOne({ where: { projectId: projectObjectId, userId: userObjectId } as never })
      } catch {
        return Promise.resolve(null)
      }
    }

    const parsedProjectId = parseInt(projectId, 10)
    const parsedUserId = parseInt(userId, 10)
    if (isNaN(parsedProjectId) || isNaN(parsedUserId)) return Promise.resolve(null)

    return this.findOne({
      where: {
        projectId: parsedProjectId,
        userId: parsedUserId,
      } as FindOptionsWhere<ProjectMember>,
    })
  }

  async findPaginatedByProjectId(
    projectId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResponseDto<ProjectMember>> {
    if (this.dbType === DatabaseType.MONGODB) {
      try {
        const projectObjectId = new ObjectId(projectId)
        const mongoRepo = this.manager.getMongoRepository(ProjectMember)
        const total = await mongoRepo.count({ projectId: projectObjectId })
        const data = await mongoRepo.find({
          where: { projectId: projectObjectId } as never,
          skip: (page - 1) * limit,
          take: limit,
          order: { joinedAt: 'ASC' } as never,
        })
        return new PaginatedResponseDto(data, total, page, limit)
      } catch {
        return new PaginatedResponseDto([], 0, page, limit)
      }
    }

    const parsedProjectId = parseInt(projectId, 10)
    if (isNaN(parsedProjectId)) return new PaginatedResponseDto([], 0, page, limit)

    const [data, total] = await this.findAndCount({
      where: { projectId: parsedProjectId } as FindOptionsWhere<ProjectMember>,
      skip: (page - 1) * limit,
      take: limit,
      order: { joinedAt: 'ASC' },
    })
    return new PaginatedResponseDto(data, total, page, limit)
  }

  async findProjectIdsByUserId(userId: string): Promise<(number | ObjectId)[]> {
    if (this.dbType === DatabaseType.MONGODB) {
      try {
        const userObjectId = new ObjectId(userId)
        const members = await this.manager
          .getMongoRepository(ProjectMember)
          .find({ where: { userId: userObjectId } as never })
        return members.map((m) => m.projectId)
      } catch {
        return []
      }
    }

    const parsedUserId = parseInt(userId, 10)
    if (isNaN(parsedUserId)) return []
    const members = await this.find({ where: { userId: parsedUserId } as FindOptionsWhere<ProjectMember> })
    return members.map((m) => m.projectId)
  }

  async deleteByProjectId(projectId: string): Promise<void> {
    if (this.dbType === DatabaseType.MONGODB) {
      try {
        const projectObjectId = new ObjectId(projectId)
        await this.manager.getMongoRepository(ProjectMember).deleteMany({ projectId: projectObjectId })
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
