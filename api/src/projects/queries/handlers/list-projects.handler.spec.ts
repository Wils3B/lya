import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto'
import { OrganisationMember, OrganisationRole } from '../../../organisations/entities/organisation-member.entity'
import { OrganisationMemberRepository } from '../../../organisations/repositories/organisation-member.repository'
import { Project } from '../../entities/project.entity'
import { ProjectMemberRepository } from '../../repositories/project-member.repository'
import { ProjectRepository } from '../../repositories/project.repository'
import { ListProjectsQuery } from '../list-projects.query'
import { ListProjectsHandler } from './list-projects.handler'

describe('ListProjectsHandler', () => {
  const allProjects = new PaginatedResponseDto<Project>([], 0, 1, 20)
  const myProjects = new PaginatedResponseDto<Project>([], 0, 1, 20)

  function makeRepos(orgRole: OrganisationRole | null) {
    const orgMember = orgRole ? ({ role: orgRole } as OrganisationMember) : null

    const findOrgMembership = jest.fn().mockResolvedValue(orgMember)
    const orgMemberRepo = { findMembership: findOrgMembership } as unknown as OrganisationMemberRepository

    const findProjectIdsByUserId = jest.fn().mockResolvedValue([1, 2])
    const projectMemberRepo = { findProjectIdsByUserId } as unknown as ProjectMemberRepository

    const findByOrgId = jest.fn().mockResolvedValue(allProjects)
    const findByProjectIds = jest.fn().mockResolvedValue(myProjects)
    const projectRepo = {
      findPaginatedByOrganisationId: findByOrgId,
      findPaginatedByProjectIds: findByProjectIds,
    } as unknown as ProjectRepository

    return { orgMemberRepo, projectMemberRepo, projectRepo, findByOrgId, findByProjectIds, findProjectIdsByUserId }
  }

  it('returns all org projects for an org admin', async () => {
    const { orgMemberRepo, projectMemberRepo, projectRepo, findByOrgId } = makeRepos(OrganisationRole.ADMINISTRATOR)
    const handler = new ListProjectsHandler(projectRepo, projectMemberRepo, orgMemberRepo)

    const result = await handler.execute(new ListProjectsQuery('10', '42', 1, 20))
    expect(findByOrgId).toHaveBeenCalledWith('10', 1, 20)
    expect(result).toBe(allProjects)
  })

  it('returns only member projects for a standard org member', async () => {
    const { orgMemberRepo, projectMemberRepo, projectRepo, findProjectIdsByUserId, findByProjectIds } = makeRepos(
      OrganisationRole.STANDARD
    )
    const handler = new ListProjectsHandler(projectRepo, projectMemberRepo, orgMemberRepo)

    const result = await handler.execute(new ListProjectsQuery('10', '42', 1, 20))
    expect(findProjectIdsByUserId).toHaveBeenCalledWith('42')
    expect(findByProjectIds).toHaveBeenCalledWith([1, 2], 1, 20)
    expect(result).toBe(myProjects)
  })

  it('returns only member projects when user has no org membership', async () => {
    const { orgMemberRepo, projectMemberRepo, projectRepo, findByProjectIds } = makeRepos(null)
    const handler = new ListProjectsHandler(projectRepo, projectMemberRepo, orgMemberRepo)

    const result = await handler.execute(new ListProjectsQuery('10', '42', 1, 20))
    expect(findByProjectIds).toHaveBeenCalled()
    expect(result).toBe(myProjects)
  })
})
