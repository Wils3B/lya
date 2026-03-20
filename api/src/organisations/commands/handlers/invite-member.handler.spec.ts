import { ConflictException } from '@nestjs/common'
import { OrganisationMember, OrganisationRole } from '../../entities/organisation-member.entity'
import { OrganisationMemberRepository } from '../../repositories/organisation-member.repository'
import { InviteMemberCommand } from '../invite-member.command'
import { InviteMemberHandler } from './invite-member.handler'

describe('InviteMemberHandler', () => {
  it('throws ConflictException when user is already a member', async () => {
    const memberRepo = {
      findMembership: jest.fn().mockResolvedValue({ role: OrganisationRole.STANDARD }),
    } as unknown as OrganisationMemberRepository

    const handler = new InviteMemberHandler(memberRepo)
    await expect(handler.execute(new InviteMemberCommand('1', 'user42', OrganisationRole.STANDARD))).rejects.toThrow(
      ConflictException
    )
  })

  it('creates a membership with the given role', async () => {
    const newMember = { role: OrganisationRole.ADMINISTRATOR } as OrganisationMember
    const memberCreateMembership = jest.fn().mockReturnValue(newMember)
    const memberRepo = {
      findMembership: jest.fn().mockResolvedValue(null),
      createMembership: memberCreateMembership,
      save: jest.fn().mockResolvedValue(newMember),
    } as unknown as OrganisationMemberRepository

    const handler = new InviteMemberHandler(memberRepo)
    const result = await handler.execute(new InviteMemberCommand('1', 'user42', OrganisationRole.ADMINISTRATOR))

    expect(memberCreateMembership).toHaveBeenCalledWith('1', 'user42', OrganisationRole.ADMINISTRATOR)
    expect(result).toBe(newMember)
  })
})
