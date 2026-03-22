import { OrganisationMember, OrganisationRole } from '../../entities/organisation-member.entity'
import { OrganisationMemberRepository } from '../../repositories/organisation-member.repository'
import { TransferOwnershipCommand } from '../transfer-ownership.command'
import { TransferOwnershipHandler } from './transfer-ownership.handler'

describe('TransferOwnershipHandler', () => {
  it('returns null when target is not a member', async () => {
    const memberRepo = { findMembership: jest.fn().mockResolvedValue(null) } as unknown as OrganisationMemberRepository

    const handler = new TransferOwnershipHandler(memberRepo)
    expect(await handler.execute(new TransferOwnershipCommand('1', 'caller', 'target'))).toBeNull()
  })

  it('demotes the caller to administrator and promotes target to owner', async () => {
    const callerMember = { role: OrganisationRole.OWNER } as OrganisationMember
    const targetMember = { role: OrganisationRole.STANDARD } as OrganisationMember

    const memberRepo = {
      findMembership: jest.fn().mockResolvedValueOnce(targetMember).mockResolvedValueOnce(callerMember),
      save: jest.fn().mockImplementation((m: OrganisationMember) => Promise.resolve(m)),
    } as unknown as OrganisationMemberRepository

    const handler = new TransferOwnershipHandler(memberRepo)
    const result = await handler.execute(new TransferOwnershipCommand('1', 'caller', 'target'))

    expect(callerMember.role).toBe(OrganisationRole.ADMINISTRATOR)
    expect(targetMember.role).toBe(OrganisationRole.OWNER)
    expect(result).toBe(targetMember)
  })
})
