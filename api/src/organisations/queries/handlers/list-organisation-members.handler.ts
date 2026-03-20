import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto'
import { OrganisationMember } from '../../entities/organisation-member.entity'
import { OrganisationMemberRepository } from '../../repositories/organisation-member.repository'
import { ListOrganisationMembersQuery } from '../list-organisation-members.query'

@QueryHandler(ListOrganisationMembersQuery)
export class ListOrganisationMembersHandler implements IQueryHandler<
  ListOrganisationMembersQuery,
  PaginatedResponseDto<OrganisationMember>
> {
  constructor(private readonly memberRepository: OrganisationMemberRepository) {}

  execute(query: ListOrganisationMembersQuery): Promise<PaginatedResponseDto<OrganisationMember>> {
    return this.memberRepository.findPaginatedByOrgId(query.organisationId, query.page, query.limit)
  }
}
