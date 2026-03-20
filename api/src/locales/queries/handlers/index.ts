import { Provider } from '@nestjs/common'
import { GetLocaleByCodeHandler } from './get-locale-by-code.handler'
import { GetLocalesHandler } from './get-locales.handler'

export const QueryHandlers: Provider[] = [GetLocaleByCodeHandler, GetLocalesHandler]
