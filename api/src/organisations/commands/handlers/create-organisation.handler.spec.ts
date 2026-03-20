import { OrganisationRole } from '../../entities/organisation-member.entity'
import { Organisation } from '../../entities/organisation.entity'
import { OrganisationMemberRepository } from '../../repositories/organisation-member.repository'
import { OrganisationRepository } from '../../repositories/organisation.repository'
import { CreateOrganisationCommand } from '../create-organisation.command'
import { CreateOrganisationHandler } from './create-organisation.handler'

describe('CreateOrganisationHandler', () => {
  it('saves the organisation and creates an owner membership', async () => {
    const savedOrg = { id: 1, name: 'Acme', slug: 'acme', description: null } as Organisation
    const orgCreate = jest.fn().mockReturnValue(savedOrg)
    const orgSave = jest.fn().mockResolvedValue(savedOrg)
    const orgRepo = {
      create: orgCreate,
      save: orgSave,
    } as unknown as OrganisationRepository

    const newMember = {}
    const memberCreateMembership = jest.fn().mockReturnValue(newMember)
    const memberSave = jest.fn().mockResolvedValue(newMember)
    const memberRepo = {
      createMembership: memberCreateMembership,
      save: memberSave,
    } as unknown as OrganisationMemberRepository

    const handler = new CreateOrganisationHandler(orgRepo, memberRepo)
    const result = await handler.execute(new CreateOrganisationCommand({ name: 'Acme' }, '42'))

    expect(orgCreate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Acme', slug: 'acme' }))
    expect(orgSave).toHaveBeenCalled()
    expect(memberCreateMembership).toHaveBeenCalledWith('1', '42', OrganisationRole.OWNER)
    expect(memberSave).toHaveBeenCalled()
    expect(result).toBe(savedOrg)
  })

  it('generates a slug from the name', async () => {
    const orgCreate = jest.fn().mockReturnValue({ id: 1 })
    const orgRepo = {
      create: orgCreate,
      save: jest.fn().mockResolvedValue({ id: 1 }),
    } as unknown as OrganisationRepository
    const memberRepo = {
      createMembership: jest.fn().mockReturnValue({}),
      save: jest.fn().mockResolvedValue({}),
    } as unknown as OrganisationMemberRepository

    const handler = new CreateOrganisationHandler(orgRepo, memberRepo)
    await handler.execute(new CreateOrganisationCommand({ name: 'My Cool Org!' }, '1'))

    expect(orgCreate).toHaveBeenCalledWith(expect.objectContaining({ slug: 'my-cool-org' }))
  })

  it('throws BadRequestException when name produces an empty slug', async () => {
    const orgRepo = {} as unknown as OrganisationRepository
    const memberRepo = {} as unknown as OrganisationMemberRepository

    const handler = new CreateOrganisationHandler(orgRepo, memberRepo)
    await expect(handler.execute(new CreateOrganisationCommand({ name: '!!!' }, '1'))).rejects.toThrow(
      'Organisation name must contain at least one alphanumeric character'
    )
  })
})
