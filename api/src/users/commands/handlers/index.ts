import { Provider } from '@nestjs/common'
import { CreateUserHandler } from './create-user.handler'
import { DeleteUserHandler } from './delete-user.handler'
import { UpdateUserHandler } from './update-user.handler'

export const CommandHandlers: Provider[] = [CreateUserHandler, DeleteUserHandler, UpdateUserHandler]
