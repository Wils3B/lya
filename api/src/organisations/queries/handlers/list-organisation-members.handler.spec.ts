import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto'
import { OrganisationMember } from '../../entities/organisation-member.entity'
import { OrganisationMemberRepository } from '../../repositories/organisation-member.repository'
import { ListOrganisationMembersQuery } from '../list-organisation-members.query'
import { ListOrganisationMembersHandler } from './list-organisation-members.handler'

describe('ListOrganisationMembersHandler', () => {
  it('delegates to findPaginatedByOrgId', async () => {
    const paginated = new PaginatedResponseDto<OrganisationMember>([], 0, 1, 20)
    const findPaginatedByOrgId = jest.fn().mockResolvedValue(paginated)
    const memberRepo = {
      findPaginatedByOrgId,
    } as unknown as OrganisationMemberRepository

    const handler = new ListOrganisationMembersHandler(memberRepo)
    const result = await handler.execute(new ListOrganisationMembersQuery('1', 1, 20))

    expect(findPaginatedByOrgId).toHaveBeenCalledWith('1', 1, 20)
    expect(result).toBe(paginated)
  })
})
