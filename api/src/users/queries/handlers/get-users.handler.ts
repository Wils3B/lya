import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto'
import { User } from '../../entities/user.entity'
import { UserRepository } from '../../repositories/user.repository'
import { GetUsersQuery } from '../get-users.query'

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery, PaginatedResponseDto<User>> {
  constructor(private readonly userRepository: UserRepository) {}

  execute(query: GetUsersQuery): Promise<PaginatedResponseDto<User>> {
    return this.userRepository.findPaginated(query.page, query.limit)
  }
}
