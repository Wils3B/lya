import { Command } from '@nestjs/cqrs'
import { UpdateUserDto } from '../dto/update-user.dto'
import { User } from '../entities/user.entity'

export class UpdateUserCommand extends Command<User | null> {
  constructor(
    public readonly id: string,
    public readonly payload: UpdateUserDto
  ) {
    super()
  }
}
