import { Query } from '@nestjs/cqrs'
import { User } from '../entities/user.entity'

export class GetUserQuery extends Query<User | null> {
  constructor(public readonly id: string) {
    super()
  }
}
