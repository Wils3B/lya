import { ForbiddenException } from '@nestjs/common'
import { OrganisationMember, OrganisationRole } from '../../entities/organisation-member.entity'
import { OrganisationMemberRepository } from '../../repositories/organisation-member.repository'
import { RemoveMemberCommand } from '../remove-member.command'
import { RemoveMemberHandler } from './remove-member.handler'

describe('RemoveMemberHandler', () => {
  it('returns null when member not found', async () => {
    const memberRepo = { findMembership: jest.fn().mockResolvedValue(null) } as unknown as OrganisationMemberRepository
    const handler = new RemoveMemberHandler(memberRepo)
    expect(await handler.execute(new RemoveMemberCommand('1', 'user99'))).toBeNull()
  })

  it('throws ForbiddenException when trying to remove an owner', async () => {
    const memberRepo = {
      findMembership: jest.fn().mockResolvedValue({ role: OrganisationRole.OWNER } as OrganisationMember),
    } as unknown as OrganisationMemberRepository

    const handler = new RemoveMemberHandler(memberRepo)
    await expect(handler.execute(new RemoveMemberCommand('1', 'owner1'))).rejects.toThrow(ForbiddenException)
  })

  it('removes a non-owner member', async () => {
    const member = { role: OrganisationRole.STANDARD } as OrganisationMember
    const memberRemove = jest.fn().mockResolvedValue(member)
    const memberRepo = {
      findMembership: jest.fn().mockResolvedValue(member),
      remove: memberRemove,
    } as unknown as OrganisationMemberRepository

    const handler = new RemoveMemberHandler(memberRepo)
    const result = await handler.execute(new RemoveMemberCommand('1', 'user1'))

    expect(memberRemove).toHaveBeenCalledWith(member)
    expect(result).toBe(member)
  })
})
