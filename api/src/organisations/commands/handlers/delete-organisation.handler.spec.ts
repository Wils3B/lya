import { Organisation } from '../../entities/organisation.entity'
import { OrganisationMemberRepository } from '../../repositories/organisation-member.repository'
import { OrganisationRepository } from '../../repositories/organisation.repository'
import { DeleteOrganisationCommand } from '../delete-organisation.command'
import { DeleteOrganisationHandler } from './delete-organisation.handler'

describe('DeleteOrganisationHandler', () => {
  it('returns null when organisation not found', async () => {
    const deleteByOrgId = jest.fn()
    const orgRepo = { findById: jest.fn().mockResolvedValue(null) } as unknown as OrganisationRepository
    const memberRepo = { deleteByOrganisationId: deleteByOrgId } as unknown as OrganisationMemberRepository

    const handler = new DeleteOrganisationHandler(orgRepo, memberRepo)
    expect(await handler.execute(new DeleteOrganisationCommand('999'))).toBeNull()
    expect(deleteByOrgId).not.toHaveBeenCalled()
  })

  it('deletes members then removes the organisation', async () => {
    const existing = { id: 1 } as Organisation
    const orgRemove = jest.fn().mockResolvedValue(existing)
    const orgRepo = {
      findById: jest.fn().mockResolvedValue(existing),
      remove: orgRemove,
    } as unknown as OrganisationRepository
    const deleteByOrgId = jest.fn().mockResolvedValue(undefined)
    const memberRepo = {
      deleteByOrganisationId: deleteByOrgId,
    } as unknown as OrganisationMemberRepository

    const handler = new DeleteOrganisationHandler(orgRepo, memberRepo)
    const result = await handler.execute(new DeleteOrganisationCommand('1'))

    expect(deleteByOrgId).toHaveBeenCalledWith('1')
    expect(orgRemove).toHaveBeenCalledWith(existing)
    expect(result).toBe(existing)
  })
})
