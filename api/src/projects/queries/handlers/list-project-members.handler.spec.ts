import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto'
import { ProjectMember } from '../../entities/project-member.entity'
import { ProjectMemberRepository } from '../../repositories/project-member.repository'
import { ListProjectMembersQuery } from '../list-project-members.query'
import { ListProjectMembersHandler } from './list-project-members.handler'

describe('ListProjectMembersHandler', () => {
  it('delegates to repository and returns paginated result', async () => {
    const paginated = new PaginatedResponseDto<ProjectMember>([], 0, 1, 20)
    const findPaginated = jest.fn().mockResolvedValue(paginated)
    const repo = { findPaginatedByProjectId: findPaginated } as unknown as ProjectMemberRepository

    const handler = new ListProjectMembersHandler(repo)
    const result = await handler.execute(new ListProjectMembersQuery('1', 1, 20))

    expect(findPaginated).toHaveBeenCalledWith('1', 1, 20)
    expect(result).toBe(paginated)
  })
})
