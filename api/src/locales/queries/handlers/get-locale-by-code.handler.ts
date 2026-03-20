import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Locale } from '../../entities/locale.entity'
import { LocaleRepository } from '../../repositories/locale.repository'
import { GetLocaleByCodeQuery } from '../get-locale-by-code.query'

@QueryHandler(GetLocaleByCodeQuery)
export class GetLocaleByCodeHandler implements IQueryHandler<GetLocaleByCodeQuery, Locale | null> {
  constructor(private readonly localeRepository: LocaleRepository) {}

  execute(query: GetLocaleByCodeQuery): Promise<Locale | null> {
    return this.localeRepository.findByCode(query.code)
  }
}
