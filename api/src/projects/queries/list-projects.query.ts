import { Query } from '@nestjs/cqrs'
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto'
import { Project } from '../entities/project.entity'

export class ListProjectsQuery extends Query<PaginatedResponseDto<Project>> {
  constructor(
    public readonly organisationId: string,
    public readonly userId: string,
    public readonly page: number,
    public readonly limit: number
  ) {
    super()
  }
}
