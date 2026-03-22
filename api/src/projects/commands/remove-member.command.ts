import { Command } from '@nestjs/cqrs'
import { ProjectMember } from '../entities/project-member.entity'

export class RemoveMemberCommand extends Command<ProjectMember | null> {
  constructor(
    public readonly projectId: string,
    public readonly userId: string
  ) {
    super()
  }
}
