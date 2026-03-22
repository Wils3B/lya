import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto'
import { Organisation } from '../../entities/organisation.entity'
import { OrganisationRepository } from '../../repositories/organisation.repository'
import { ListUserOrganisationsQuery } from '../list-user-organisations.query'

@QueryHandler(ListUserOrganisationsQuery)
export class ListUserOrganisationsHandler implements IQueryHandler<
  ListUserOrganisationsQuery,
  PaginatedResponseDto<Organisation>
> {
  constructor(private readonly organisationRepository: OrganisationRepository) {}

  execute(query: ListUserOrganisationsQuery): Promise<PaginatedResponseDto<Organisation>> {
    return this.organisationRepository.findPaginatedByUserId(query.userId, query.page, query.limit)
  }
}
