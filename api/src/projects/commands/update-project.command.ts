import { UpdateProjectDto } from '../dto/update-project.dto'

export class UpdateProjectCommand {
  constructor(
    public readonly projectId: string,
    public readonly organisationId: string,
    public readonly payload: UpdateProjectDto
  ) {}
}
