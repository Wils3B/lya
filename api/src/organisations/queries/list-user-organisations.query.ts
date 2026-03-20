import { Query } from '@nestjs/cqrs'
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto'
import { Organisation } from '../entities/organisation.entity'

export class ListUserOrganisationsQuery extends Query<PaginatedResponseDto<Organisation>> {
  constructor(
    public readonly userId: string,
    public readonly page: number,
    public readonly limit: number
  ) {
    super()
  }
}
