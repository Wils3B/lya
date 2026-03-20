import { Organisation } from '../../entities/organisation.entity'
import { OrganisationRepository } from '../../repositories/organisation.repository'
import { GetOrganisationQuery } from '../get-organisation.query'
import { GetOrganisationHandler } from './get-organisation.handler'

describe('GetOrganisationHandler', () => {
  it('delegates to findByIdOrSlug', async () => {
    const org = { id: 1, slug: 'acme' } as Organisation
    const findByIdOrSlug = jest.fn().mockResolvedValue(org)
    const orgRepo = { findByIdOrSlug } as unknown as OrganisationRepository

    const handler = new GetOrganisationHandler(orgRepo)
    const result = await handler.execute(new GetOrganisationQuery('1'))

    expect(findByIdOrSlug).toHaveBeenCalledWith('1')
    expect(result).toBe(org)
  })

  it('returns null when not found', async () => {
    const orgRepo = { findByIdOrSlug: jest.fn().mockResolvedValue(null) } as unknown as OrganisationRepository

    const handler = new GetOrganisationHandler(orgRepo)
    expect(await handler.execute(new GetOrganisationQuery('slug-nope'))).toBeNull()
  })
})
