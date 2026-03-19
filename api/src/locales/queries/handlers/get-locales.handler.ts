import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto'
import { Locale } from '../../entities/locale.entity'
import { LocaleRepository } from '../../repositories/locale.repository'
import { GetLocalesQuery } from '../get-locales.query'

@QueryHandler(GetLocalesQuery)
export class GetLocalesHandler implements IQueryHandler<GetLocalesQuery, PaginatedResponseDto<Locale> | Locale[]> {
  constructor(private readonly localeRepository: LocaleRepository) {}

  execute(query: GetLocalesQuery): Promise<PaginatedResponseDto<Locale> | Locale[]> {
    if (!query.pagination) {
      return this.localeRepository.findAllFiltered(query.search, query.direction)
    }
    return this.localeRepository.findPaginated(query.page, query.limit, query.search, query.direction)
  }
}
