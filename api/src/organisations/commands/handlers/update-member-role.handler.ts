import { ForbiddenException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { OrganisationMember, OrganisationRole } from '../../entities/organisation-member.entity'
import { OrganisationMemberRepository } from '../../repositories/organisation-member.repository'
import { UpdateMemberRoleCommand } from '../update-member-role.command'

@CommandHandler(UpdateMemberRoleCommand)
export class UpdateMemberRoleHandler implements ICommandHandler<UpdateMemberRoleCommand, OrganisationMember | null> {
  constructor(private readonly memberRepository: OrganisationMemberRepository) {}

  async execute(command: UpdateMemberRoleCommand): Promise<OrganisationMember | null> {
    const member = await this.memberRepository.findMembership(command.organisationId, command.targetUserId)
    if (!member) return null

    if (member.role === OrganisationRole.OWNER) {
      throw new ForbiddenException("Cannot change an owner's role — use transfer ownership")
    }

    member.role = command.role
    return this.memberRepository.save(member)
  }
}
