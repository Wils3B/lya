import { Command } from '@nestjs/cqrs'
import { User } from '../entities/user.entity'

export class DeleteUserCommand extends Command<User | null> {
  constructor(public readonly id: string) {
    super()
  }
}
