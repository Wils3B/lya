import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { User } from '../../entities/user.entity'
import { UserRepository } from '../../repositories/user.repository'
import { DeleteUserCommand } from '../delete-user.command'

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand, User | null> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: DeleteUserCommand): Promise<User | null> {
    const existing = await this.userRepository.findById(command.id)
    if (!existing) {
      return null
    }
    return this.userRepository.remove(existing)
  }
}
