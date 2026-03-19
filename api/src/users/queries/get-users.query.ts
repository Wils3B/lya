import { Query } from '@nestjs/cqrs'
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto'
import { User } from '../entities/user.entity'

export class GetUsersQuery extends Query<PaginatedResponseDto<User>> {
  constructor(
    public readonly page: number,
    public readonly limit: number
  ) {
    super()
  }
}
