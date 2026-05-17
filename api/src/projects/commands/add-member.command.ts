import { Command } from '@nestjs/cqrs'
import { ProjectMember } from '../entities/project-member.entity'
import { ProjectRole } from '../entities/project-role.enum'

export class AddMemberCommand extends Command<ProjectMember> {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
    public readonly role: ProjectRole
  ) {
    super()
  }
}
