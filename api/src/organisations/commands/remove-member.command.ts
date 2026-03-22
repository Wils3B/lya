import { Command } from '@nestjs/cqrs'
import { OrganisationMember } from '../entities/organisation-member.entity'

export class RemoveMemberCommand extends Command<OrganisationMember | null> {
  constructor(
    public readonly organisationId: string,
    public readonly targetUserId: string
  ) {
    super()
  }
}
