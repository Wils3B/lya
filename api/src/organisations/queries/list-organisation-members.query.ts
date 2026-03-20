import { Query } from '@nestjs/cqrs'
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto'
import { OrganisationMember } from '../entities/organisation-member.entity'

export class ListOrganisationMembersQuery extends Query<PaginatedResponseDto<OrganisationMember>> {
  constructor(
    public readonly organisationId: string,
    public readonly page: number,
    public readonly limit: number
  ) {
    super()
  }
}
