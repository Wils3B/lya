import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { User } from '../../entities/user.entity'
import { UserRepository } from '../../repositories/user.repository'
import { UpdateUserCommand } from '../update-user.command'

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand, User | null> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdateUserCommand): Promise<User | null> {
    const existing = await this.userRepository.findById(command.id)
    if (!existing) {
      return null
    }
    this.userRepository.merge(existing, command.payload)
    return this.userRepository.save(existing)
  }
}
