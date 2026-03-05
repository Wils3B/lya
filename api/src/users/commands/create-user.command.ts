import { Command } from '@nestjs/cqrs'
import { CreateUserDto } from '../dto/create-user.dto'
import { User } from '../entities/user.entity'

export class CreateUserCommand extends Command<User> {
  constructor(public readonly payload: CreateUserDto) {
    super()
  }
}
