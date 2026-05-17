import { ConflictException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ProjectMember } from '../../entities/project-member.entity'
import { ProjectMemberRepository } from '../../repositories/project-member.repository'
import { AddMemberCommand } from '../add-member.command'

@CommandHandler(AddMemberCommand)
export class AddMemberHandler implements ICommandHandler<AddMemberCommand, ProjectMember> {
  constructor(private readonly memberRepository: ProjectMemberRepository) {}

  async execute(command: AddMemberCommand): Promise<ProjectMember> {
    const existing = await this.memberRepository.findMembership(command.projectId, command.userId)
    if (existing) {
      throw new ConflictException('User is already a member of this project')
    }

    const member = this.memberRepository.createMembership(command.projectId, command.userId, command.role)
    return this.memberRepository.save(member)
  }
}
