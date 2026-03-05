import { Provider } from '@nestjs/common'
import { GetUserHandler } from './get-user.handler'
import { GetUsersHandler } from './get-users.handler'

export const QueryHandlers: Provider[] = [GetUserHandler, GetUsersHandler]
