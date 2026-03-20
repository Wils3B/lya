import { ForbiddenException } from '@nestjs/common'
import { OrganisationMember, OrganisationRole } from '../../entities/organisation-member.entity'
import { OrganisationMemberRepository } from '../../repositories/organisation-member.repository'
import { UpdateMemberRoleCommand } from '../update-member-role.command'
import { UpdateMemberRoleHandler } from './update-member-role.handler'

describe('UpdateMemberRoleHandler', () => {
  it('returns null when member not found', async () => {
    const memberRepo = { findMembership: jest.fn().mockResolvedValue(null) } as unknown as OrganisationMemberRepository
    const handler = new UpdateMemberRoleHandler(memberRepo)
    expect(await handler.execute(new UpdateMemberRoleCommand('1', 'user99', OrganisationRole.STANDARD))).toBeNull()
  })

  it("throws ForbiddenException when changing an owner's role", async () => {
    const memberRepo = {
      findMembership: jest.fn().mockResolvedValue({ role: OrganisationRole.OWNER } as OrganisationMember),
    } as unknown as OrganisationMemberRepository

    const handler = new UpdateMemberRoleHandler(memberRepo)
    await expect(
      handler.execute(new UpdateMemberRoleCommand('1', 'owner1', OrganisationRole.ADMINISTRATOR))
    ).rejects.toThrow(ForbiddenException)
  })

  it('updates the member role', async () => {
    const member = { role: OrganisationRole.STANDARD } as OrganisationMember
    const memberRepo = {
      findMembership: jest.fn().mockResolvedValue(member),
      save: jest.fn().mockImplementation((m: OrganisationMember) => Promise.resolve(m)),
    } as unknown as OrganisationMemberRepository

    const handler = new UpdateMemberRoleHandler(memberRepo)
    const result = await handler.execute(new UpdateMemberRoleCommand('1', 'user1', OrganisationRole.ADMINISTRATOR))

    expect(member.role).toBe(OrganisationRole.ADMINISTRATOR)
    expect(result).toBe(member)
  })
})
