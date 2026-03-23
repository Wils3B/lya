import { Query } from '@nestjs/cqrs'
import { Project } from '../entities/project.entity'

export class GetProjectBySlugQuery extends Query<Project | null> {
  constructor(
    public readonly organisationId: string,
    public readonly slug: string
  ) {
    super()
  }
}
