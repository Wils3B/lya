import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Locale } from '../../entities/locale.entity'
import { LocaleRepository } from '../../repositories/locale.repository'
import { GetLocaleQuery } from '../get-locale.query'

@QueryHandler(GetLocaleQuery)
export class GetLocaleHandler implements IQueryHandler<GetLocaleQuery, Locale | null> {
  constructor(private readonly localeRepository: LocaleRepository) {}

  execute(query: GetLocaleQuery): Promise<Locale | null> {
    return this.localeRepository.findByCode(query.code)
  }
}
