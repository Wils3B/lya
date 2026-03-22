import { ProjectRole } from '../entities/project-role.enum'

export class UpdateMemberRoleCommand {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
    public readonly role: ProjectRole
  ) {}
}
