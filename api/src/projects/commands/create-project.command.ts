import { Command } from '@nestjs/cqrs'
import { CreateProjectDto } from '../dto/create-project.dto'
import { Project } from '../entities/project.entity'

export class CreateProjectCommand extends Command<Project> {
  constructor(
    public readonly organisationId: string,
    public readonly payload: CreateProjectDto,
    public readonly userId: string
  ) {
    super()
  }
}
