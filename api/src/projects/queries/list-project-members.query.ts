import { Query } from '@nestjs/cqrs'
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto'
import { ProjectMember } from '../entities/project-member.entity'

export class ListProjectMembersQuery extends Query<PaginatedResponseDto<ProjectMember>> {
  constructor(
    public readonly projectId: string,
    public readonly page: number,
    public readonly limit: number
  ) {
    super()
  }
}
