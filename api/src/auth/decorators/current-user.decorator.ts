import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export interface CurrentUserPayload {
  id: string
  email: string
}

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
  const request = ctx.switchToHttp().getRequest<Request>()
  return request.user as CurrentUserPayload
})
