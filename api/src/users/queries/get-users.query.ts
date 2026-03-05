import { Query } from '@nestjs/cqrs'
import { User } from '../entities/user.entity'

export class GetUsersQuery extends Query<User[]> {
  constructor() {
    super()
  }
}
