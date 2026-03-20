import { Organisation } from '../../entities/organisation.entity'
import { OrganisationRepository } from '../../repositories/organisation.repository'
import { UpdateOrganisationCommand } from '../update-organisation.command'
import { UpdateOrganisationHandler } from './update-organisation.handler'

describe('UpdateOrganisationHandler', () => {
  it('returns null when organisation not found', async () => {
    const orgRepo = { findById: jest.fn().mockResolvedValue(null) } as unknown as OrganisationRepository
    const handler = new UpdateOrganisationHandler(orgRepo)
    const result = await handler.execute(new UpdateOrganisationCommand('999', { name: 'New' }))
    expect(result).toBeNull()
  })

  it('merges and saves the organisation', async () => {
    const existing = { id: 1, name: 'Old', slug: 'old' } as Organisation
    const updated = { ...existing, name: 'New' } as Organisation
    const orgMerge = jest.fn()
    const orgSave = jest.fn().mockResolvedValue(updated)
    const orgRepo = {
      findById: jest.fn().mockResolvedValue(existing),
      merge: orgMerge,
      save: orgSave,
    } as unknown as OrganisationRepository

    const handler = new UpdateOrganisationHandler(orgRepo)
    const result = await handler.execute(new UpdateOrganisationCommand('1', { name: 'New' }))

    expect(orgMerge).toHaveBeenCalledWith(existing, expect.objectContaining({ name: 'New' }))
    expect(orgSave).toHaveBeenCalledWith(existing)
    expect(result).toBe(updated)
  })

  it('normalises the slug when provided', async () => {
    const existing = { id: 1, slug: 'old' } as Organisation
    const orgMerge = jest.fn()
    const orgRepo = {
      findById: jest.fn().mockResolvedValue(existing),
      merge: orgMerge,
      save: jest.fn().mockResolvedValue(existing),
    } as unknown as OrganisationRepository

    const handler = new UpdateOrganisationHandler(orgRepo)
    await handler.execute(new UpdateOrganisationCommand('1', { slug: 'My New Slug!' }))

    expect(orgMerge).toHaveBeenCalledWith(existing, expect.objectContaining({ slug: 'my-new-slug' }))
  })
})
