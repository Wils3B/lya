import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto'
import { ProjectMember } from '../../entities/project-member.entity'
import { ProjectMemberRepository } from '../../repositories/project-member.repository'
import { ListProjectMembersQuery } from '../list-project-members.query'

@QueryHandler(ListProjectMembersQuery)
export class ListProjectMembersHandler implements IQueryHandler<
  ListProjectMembersQuery,
  PaginatedResponseDto<ProjectMember>
> {
  constructor(private readonly memberRepository: ProjectMemberRepository) {}

  execute(query: ListProjectMembersQuery): Promise<PaginatedResponseDto<ProjectMember>> {
    return this.memberRepository.findPaginatedByProjectId(query.projectId, query.page, query.limit)
  }
}
