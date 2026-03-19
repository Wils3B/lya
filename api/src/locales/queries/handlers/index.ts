import { Provider } from '@nestjs/common'
import { GetLocaleHandler } from './get-locale.handler'
import { GetLocalesHandler } from './get-locales.handler'

export const QueryHandlers: Provider[] = [GetLocaleHandler, GetLocalesHandler]
