import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ProjectMember } from '../../entities/project-member.entity'
import { ProjectMemberRepository } from '../../repositories/project-member.repository'
import { UpdateMemberRoleCommand } from '../update-member-role.command'

@CommandHandler(UpdateMemberRoleCommand)
export class UpdateMemberRoleHandler implements ICommandHandler<UpdateMemberRoleCommand, ProjectMember | null> {
  constructor(private readonly memberRepository: ProjectMemberRepository) {}

  async execute(command: UpdateMemberRoleCommand): Promise<ProjectMember | null> {
    const member = await this.memberRepository.findMembership(command.projectId, command.userId)
    if (!member) return null

    member.role = command.role
    return this.memberRepository.save(member)
  }
}
