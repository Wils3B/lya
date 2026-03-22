import { Command } from '@nestjs/cqrs'
import { OrganisationMember, OrganisationRole } from '../entities/organisation-member.entity'

export class InviteMemberCommand extends Command<OrganisationMember> {
  constructor(
    public readonly organisationId: string,
    public readonly targetUserId: string,
    public readonly role: OrganisationRole
  ) {
    super()
  }
}
