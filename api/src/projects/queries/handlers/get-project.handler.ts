import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Project } from '../../entities/project.entity'
import { ProjectRepository } from '../../repositories/project.repository'
import { GetProjectQuery } from '../get-project.query'

@QueryHandler(GetProjectQuery)
export class GetProjectHandler implements IQueryHandler<GetProjectQuery, Project | null> {
  constructor(private readonly projectRepository: ProjectRepository) {}

  execute(query: GetProjectQuery): Promise<Project | null> {
    return this.projectRepository.findById(query.projectId)
  }
}
