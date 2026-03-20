import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto'
import { Organisation } from '../../entities/organisation.entity'
import { OrganisationRepository } from '../../repositories/organisation.repository'
import { ListUserOrganisationsQuery } from '../list-user-organisations.query'
import { ListUserOrganisationsHandler } from './list-user-organisations.handler'

describe('ListUserOrganisationsHandler', () => {
  it('delegates to findPaginatedByUserId', async () => {
    const paginated = new PaginatedResponseDto<Organisation>([], 0, 1, 20)
    const findPaginatedByUserId = jest.fn().mockResolvedValue(paginated)
    const orgRepo = {
      findPaginatedByUserId,
    } as unknown as OrganisationRepository

    const handler = new ListUserOrganisationsHandler(orgRepo)
    const result = await handler.execute(new ListUserOrganisationsQuery('42', 1, 20))

    expect(findPaginatedByUserId).toHaveBeenCalledWith('42', 1, 20)
    expect(result).toBe(paginated)
  })
})
