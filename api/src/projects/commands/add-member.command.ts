import { ProjectRole } from '../entities/project-role.enum'

export class AddMemberCommand {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
    public readonly role: ProjectRole
  ) {}
}
