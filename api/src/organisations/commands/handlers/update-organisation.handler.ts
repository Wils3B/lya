import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Organisation } from '../../entities/organisation.entity'
import { OrganisationRepository } from '../../repositories/organisation.repository'
import { UpdateOrganisationCommand } from '../update-organisation.command'

@CommandHandler(UpdateOrganisationCommand)
export class UpdateOrganisationHandler implements ICommandHandler<UpdateOrganisationCommand, Organisation | null> {
  constructor(private readonly organisationRepository: OrganisationRepository) {}

  async execute(command: UpdateOrganisationCommand): Promise<Organisation | null> {
    const existing = await this.organisationRepository.findById(command.id)
    if (!existing) return null

    this.organisationRepository.merge(existing, command.payload)
    return this.organisationRepository.save(existing)
  }
}
