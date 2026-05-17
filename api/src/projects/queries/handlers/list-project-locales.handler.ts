import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto'
import { ProjectLocale } from '../../entities/project-locale.entity'
import { ProjectLocaleRepository } from '../../repositories/project-locale.repository'
import { ListProjectLocalesQuery } from '../list-project-locales.query'

@QueryHandler(ListProjectLocalesQuery)
export class ListProjectLocalesHandler implements IQueryHandler<
  ListProjectLocalesQuery,
  PaginatedResponseDto<ProjectLocale>
> {
  constructor(private readonly projectLocaleRepository: ProjectLocaleRepository) {}

  execute(query: ListProjectLocalesQuery): Promise<PaginatedResponseDto<ProjectLocale>> {
    return this.projectLocaleRepository.findPaginatedByProjectId(query.projectId, query.page, query.limit)
  }
}
