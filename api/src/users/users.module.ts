import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommandHandlers } from './commands/handlers'
import { User } from './entities/user.entity'
import { QueryHandlers } from './queries/handlers'
import { UserRepository } from './repositories/user.repository'
import { UsersController } from './users.controller'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UserRepository, ...CommandHandlers, ...QueryHandlers],
})
export class UsersModule {}
