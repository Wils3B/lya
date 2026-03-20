import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { OrganisationRole } from '../../entities/organisation-member.entity'
import { Organisation } from '../../entities/organisation.entity'
import { OrganisationMemberRepository } from '../../repositories/organisation-member.repository'
import { OrganisationRepository } from '../../repositories/organisation.repository'
import { generateSlug } from '../../utils/slug'
import { CreateOrganisationCommand } from '../create-organisation.command'

@CommandHandler(CreateOrganisationCommand)
export class CreateOrganisationHandler implements ICommandHandler<CreateOrganisationCommand, Organisation> {
  constructor(
    private readonly organisationRepository: OrganisationRepository,
    private readonly memberRepository: OrganisationMemberRepository
  ) {}

  async execute(command: CreateOrganisationCommand): Promise<Organisation> {
    const { name, description } = command.payload
    const org = this.organisationRepository.create({ name, slug: generateSlug(name), description: description ?? null })
    const savedOrg = await this.organisationRepository.save(org)

    const member = this.memberRepository.create({
      organisationId: savedOrg.id as unknown as number,
      userId: command.userId as unknown as number,
      role: OrganisationRole.OWNER,
    })
    await this.memberRepository.save(member)

    return savedOrg
  }
}
