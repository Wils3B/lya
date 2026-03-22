import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ProjectMember } from '../../entities/project-member.entity'
import { ProjectMemberRepository } from '../../repositories/project-member.repository'
import { RemoveMemberCommand } from '../remove-member.command'

@CommandHandler(RemoveMemberCommand)
export class RemoveMemberHandler implements ICommandHandler<RemoveMemberCommand, ProjectMember | null> {
  constructor(private readonly memberRepository: ProjectMemberRepository) {}

  async execute(command: RemoveMemberCommand): Promise<ProjectMember | null> {
    const member = await this.memberRepository.findMembership(command.projectId, command.userId)
    if (!member) return null

    await this.memberRepository.remove(member)
    return member
  }
}
