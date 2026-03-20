import { Command } from '@nestjs/cqrs'
import { OrganisationMember } from '../entities/organisation-member.entity'

export class LeaveOrganisationCommand extends Command<OrganisationMember | null> {
  constructor(
    public readonly organisationId: string,
    public readonly callerId: string
  ) {
    super()
  }
}
