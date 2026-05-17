import { Command } from '@nestjs/cqrs'
import { UpdateProjectDto } from '../dto/update-project.dto'
import { Project } from '../entities/project.entity'

export class UpdateProjectCommand extends Command<Project | null> {
  constructor(
    public readonly projectId: string,
    public readonly organisationId: string,
    public readonly payload: UpdateProjectDto
  ) {
    super()
  }
}
