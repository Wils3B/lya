import { Query } from '@nestjs/cqrs'
import { Project } from '../entities/project.entity'

export class GetProjectQuery extends Query<Project | null> {
  constructor(public readonly projectId: string) {
    super()
  }
}
