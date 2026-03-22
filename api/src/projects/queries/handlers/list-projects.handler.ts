import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto'
import { OrganisationRole } from '../../../organisations/entities/organisation-member.entity'
import { OrganisationMemberRepository } from '../../../organisations/repositories/organisation-member.repository'
import { Project } from '../../entities/project.entity'
import { ProjectMemberRepository } from '../../repositories/project-member.repository'
import { ProjectRepository } from '../../repositories/project.repository'
import { ListProjectsQuery } from '../list-projects.query'

@QueryHandler(ListProjectsQuery)
export class ListProjectsHandler implements IQueryHandler<ListProjectsQuery, PaginatedResponseDto<Project>> {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectMemberRepository: ProjectMemberRepository,
    private readonly orgMemberRepository: OrganisationMemberRepository
  ) {}

  async execute(query: ListProjectsQuery): Promise<PaginatedResponseDto<Project>> {
    const { organisationId, userId, page, limit } = query

    const orgMember = await this.orgMemberRepository.findMembership(organisationId, userId)

    // Org owners/admins see all projects
    const isOrgAdmin = orgMember?.role === OrganisationRole.OWNER || orgMember?.role === OrganisationRole.ADMINISTRATOR

    if (isOrgAdmin) {
      return this.projectRepository.findPaginatedByOrganisationId(organisationId, page, limit)
    }

    // Standard members see only projects they're explicitly added to
    const projectIds = await this.projectMemberRepository.findProjectIdsByUserId(userId)
    return this.projectRepository.findPaginatedByProjectIds(projectIds, page, limit)
  }
}
