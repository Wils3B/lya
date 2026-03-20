import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Organisation } from '../../entities/organisation.entity'
import { OrganisationMemberRepository } from '../../repositories/organisation-member.repository'
import { OrganisationRepository } from '../../repositories/organisation.repository'
import { DeleteOrganisationCommand } from '../delete-organisation.command'

@CommandHandler(DeleteOrganisationCommand)
export class DeleteOrganisationHandler implements ICommandHandler<DeleteOrganisationCommand, Organisation | null> {
  constructor(
    private readonly organisationRepository: OrganisationRepository,
    private readonly memberRepository: OrganisationMemberRepository
  ) {}

  async execute(command: DeleteOrganisationCommand): Promise<Organisation | null> {
    const existing = await this.organisationRepository.findById(command.id)
    if (!existing) return null

    await this.memberRepository.deleteByOrganisationId(command.id)
    return this.organisationRepository.remove(existing)
  }
}
