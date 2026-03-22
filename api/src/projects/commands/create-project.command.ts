import { CreateProjectDto } from '../dto/create-project.dto'

export class CreateProjectCommand {
  constructor(
    public readonly organisationId: string,
    public readonly payload: CreateProjectDto,
    public readonly userId: string
  ) {}
}
