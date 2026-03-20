import { BadRequestException } from '@nestjs/common'
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
    const slug = generateSlug(name)
    if (!slug) throw new BadRequestException('Organisation name must contain at least one alphanumeric character')

    const org = this.organisationRepository.create({ name, slug, description: description ?? null })
    const savedOrg = await this.organisationRepository.save(org)

    const member = this.memberRepository.createMembership(String(savedOrg.id), command.userId, OrganisationRole.OWNER)
    await this.memberRepository.save(member)

    return savedOrg
  }
}
