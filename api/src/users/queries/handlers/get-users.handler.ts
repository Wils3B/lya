import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { User } from '../../entities/user.entity'
import { UserRepository } from '../../repositories/user.repository'
import { GetUsersQuery } from '../get-users.query'

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery, User[]> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepository.find()
  }
}
