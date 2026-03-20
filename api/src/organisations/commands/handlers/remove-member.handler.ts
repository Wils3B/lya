import { ForbiddenException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { OrganisationMember, OrganisationRole } from '../../entities/organisation-member.entity'
import { OrganisationMemberRepository } from '../../repositories/organisation-member.repository'
import { RemoveMemberCommand } from '../remove-member.command'

@CommandHandler(RemoveMemberCommand)
export class RemoveMemberHandler implements ICommandHandler<RemoveMemberCommand, OrganisationMember | null> {
  constructor(private readonly memberRepository: OrganisationMemberRepository) {}

  async execute(command: RemoveMemberCommand): Promise<OrganisationMember | null> {
    const member = await this.memberRepository.findMembership(command.organisationId, command.targetUserId)
    if (!member) return null

    if (member.role === OrganisationRole.OWNER) {
      throw new ForbiddenException('Cannot remove an owner — transfer ownership first')
    }

    return this.memberRepository.remove(member)
  }
}
