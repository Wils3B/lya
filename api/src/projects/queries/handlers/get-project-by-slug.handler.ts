import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Project } from '../../entities/project.entity'
import { ProjectRepository } from '../../repositories/project.repository'
import { GetProjectBySlugQuery } from '../get-project-by-slug.query'

@QueryHandler(GetProjectBySlugQuery)
export class GetProjectBySlugHandler implements IQueryHandler<GetProjectBySlugQuery, Project | null> {
  constructor(private readonly projectRepository: ProjectRepository) {}

  execute(query: GetProjectBySlugQuery): Promise<Project | null> {
    return this.projectRepository.findBySlug(query.organisationId, query.slug)
  }
}
