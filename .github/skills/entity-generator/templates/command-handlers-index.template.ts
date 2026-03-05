import { CreateResourceHandler } from './create-resource.handler'
import { UpdateResourceHandler } from './update-resource.handler'
import { DeleteResourceHandler } from './delete-resource.handler'

export const CommandHandlers = [
  CreateResourceHandler,
  UpdateResourceHandler,
  DeleteResourceHandler,
]
