import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Organisation } from '../../entities/organisation.entity'
import { OrganisationRepository } from '../../repositories/organisation.repository'
import { GetOrganisationQuery } from '../get-organisation.query'

@QueryHandler(GetOrganisationQuery)
export class GetOrganisationHandler implements IQueryHandler<GetOrganisationQuery, Organisation | null> {
  constructor(private readonly organisationRepository: OrganisationRepository) {}

  execute(query: GetOrganisationQuery): Promise<Organisation | null> {
    return this.organisationRepository.findByIdOrSlug(query.identifier)
  }
}
