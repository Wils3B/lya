import { Query } from '@nestjs/cqrs'
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto'
import { ProjectLocale } from '../entities/project-locale.entity'

export class ListProjectLocalesQuery extends Query<PaginatedResponseDto<ProjectLocale>> {
  constructor(
    public readonly projectId: string,
    public readonly page: number,
    public readonly limit: number
  ) {
    super()
  }
}
