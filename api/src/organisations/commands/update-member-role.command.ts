import { Command } from '@nestjs/cqrs'
import { OrganisationMember, OrganisationRole } from '../entities/organisation-member.entity'

export class UpdateMemberRoleCommand extends Command<OrganisationMember | null> {
  constructor(
    public readonly organisationId: string,
    public readonly targetUserId: string,
    public readonly role: OrganisationRole.ADMINISTRATOR | OrganisationRole.STANDARD
  ) {
    super()
  }
}
