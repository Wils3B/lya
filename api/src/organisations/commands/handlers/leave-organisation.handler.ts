import { ForbiddenException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { OrganisationMember, OrganisationRole } from '../../entities/organisation-member.entity'
import { OrganisationMemberRepository } from '../../repositories/organisation-member.repository'
import { LeaveOrganisationCommand } from '../leave-organisation.command'

@CommandHandler(LeaveOrganisationCommand)
export class LeaveOrganisationHandler implements ICommandHandler<LeaveOrganisationCommand, OrganisationMember | null> {
  constructor(private readonly memberRepository: OrganisationMemberRepository) {}

  async execute(command: LeaveOrganisationCommand): Promise<OrganisationMember | null> {
    const member = await this.memberRepository.findMembership(command.organisationId, command.callerId)
    if (!member) return null

    if (member.role === OrganisationRole.OWNER) {
      const ownerCount = await this.memberRepository.countOwnersByOrgId(command.organisationId)
      if (ownerCount <= 1) {
        throw new ForbiddenException('Cannot leave as the last owner — transfer ownership first')
      }
    }

    return this.memberRepository.remove(member)
  }
}
