import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import * as bcrypt from 'bcrypt'
import { User } from '../../entities/user.entity'
import { UserRepository } from '../../repositories/user.repository'
import { CreateUserCommand } from '../create-user.command'

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, User> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const { password, ...rest } = command.payload
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = this.userRepository.create({ ...rest, password: hashedPassword })
    return this.userRepository.save(user)
  }
}
