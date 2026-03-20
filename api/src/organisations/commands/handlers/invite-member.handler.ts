import { ConflictException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { OrganisationMember, OrganisationRole } from '../../entities/organisation-member.entity'
import { OrganisationMemberRepository } from '../../repositories/organisation-member.repository'
import { InviteMemberCommand } from '../invite-member.command'

@CommandHandler(InviteMemberCommand)
export class InviteMemberHandler implements ICommandHandler<InviteMemberCommand, OrganisationMember> {
  constructor(private readonly memberRepository: OrganisationMemberRepository) {}

  async execute(command: InviteMemberCommand): Promise<OrganisationMember> {
    const existing = await this.memberRepository.findMembership(command.organisationId, command.targetUserId)
    if (existing) {
      throw new ConflictException('User is already a member of this organisation')
    }

    const member = this.memberRepository.create({
      organisationId: command.organisationId as unknown as number,
      userId: command.targetUserId as unknown as number,
      role: command.role ?? OrganisationRole.STANDARD,
    })
    return this.memberRepository.save(member)
  }
}
