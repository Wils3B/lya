import { Command } from '@nestjs/cqrs'
import { Project } from '../entities/project.entity'

export class DeleteProjectCommand extends Command<Project | null> {
  constructor(
    public readonly projectId: string,
    public readonly organisationId: string
  ) {
    super()
  }
}
