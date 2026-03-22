import { ForbiddenException } from '@nestjs/common'
import { OrganisationMember, OrganisationRole } from '../../entities/organisation-member.entity'
import { OrganisationMemberRepository } from '../../repositories/organisation-member.repository'
import { LeaveOrganisationCommand } from '../leave-organisation.command'
import { LeaveOrganisationHandler } from './leave-organisation.handler'

describe('LeaveOrganisationHandler', () => {
  it('returns null when caller is not a member', async () => {
    const memberRepo = { findMembership: jest.fn().mockResolvedValue(null) } as unknown as OrganisationMemberRepository
    const handler = new LeaveOrganisationHandler(memberRepo)
    expect(await handler.execute(new LeaveOrganisationCommand('1', 'user99'))).toBeNull()
  })

  it('throws ForbiddenException when the caller is the last owner', async () => {
    const member = { role: OrganisationRole.OWNER } as OrganisationMember
    const memberRepo = {
      findMembership: jest.fn().mockResolvedValue(member),
      countOwnersByOrgId: jest.fn().mockResolvedValue(1),
    } as unknown as OrganisationMemberRepository

    const handler = new LeaveOrganisationHandler(memberRepo)
    await expect(handler.execute(new LeaveOrganisationCommand('1', 'owner1'))).rejects.toThrow(ForbiddenException)
  })

  it('allows an owner to leave when there is another owner', async () => {
    const member = { role: OrganisationRole.OWNER } as OrganisationMember
    const memberRemove = jest.fn().mockResolvedValue(member)
    const memberRepo = {
      findMembership: jest.fn().mockResolvedValue(member),
      countOwnersByOrgId: jest.fn().mockResolvedValue(2),
      remove: memberRemove,
    } as unknown as OrganisationMemberRepository

    const handler = new LeaveOrganisationHandler(memberRepo)
    const result = await handler.execute(new LeaveOrganisationCommand('1', 'owner1'))

    expect(memberRemove).toHaveBeenCalledWith(member)
    expect(result).toBe(member)
  })

  it('allows a standard member to leave', async () => {
    const member = { role: OrganisationRole.STANDARD } as OrganisationMember
    const memberRemove = jest.fn().mockResolvedValue(member)
    const memberRepo = {
      findMembership: jest.fn().mockResolvedValue(member),
      remove: memberRemove,
    } as unknown as OrganisationMemberRepository

    const handler = new LeaveOrganisationHandler(memberRepo)
    const result = await handler.execute(new LeaveOrganisationCommand('1', 'user1'))

    expect(memberRemove).toHaveBeenCalledWith(member)
    expect(result).toBe(member)
  })
})
