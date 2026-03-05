import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { User } from '../../entities/user.entity'
import { UserRepository } from '../../repositories/user.repository'
import { CreateUserCommand } from '../create-user.command'

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, User> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const user = this.userRepository.create(command.payload)
    return this.userRepository.save(user)
  }
}
