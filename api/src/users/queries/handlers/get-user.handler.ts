import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { User } from '../../entities/user.entity'
import { UserRepository } from '../../repositories/user.repository'
import { GetUserQuery } from '../get-user.query'

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery, User | null> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserQuery): Promise<User | null> {
    return this.userRepository.findById(query.id)
  }
}
