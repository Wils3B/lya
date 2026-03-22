import { ProjectMember } from '../../entities/project-member.entity'
import { ProjectMemberRepository } from '../../repositories/project-member.repository'
import { RemoveMemberCommand } from '../remove-member.command'
import { RemoveMemberHandler } from './remove-member.handler'

describe('RemoveMemberHandler', () => {
  const member = { id: 1 } as ProjectMember

  it('returns null when member not found', async () => {
    const findMembership = jest.fn().mockResolvedValue(null)
    const remove = jest.fn()
    const repo = { findMembership, remove } as unknown as ProjectMemberRepository

    const handler = new RemoveMemberHandler(repo)
    const result = await handler.execute(new RemoveMemberCommand('1', '2'))
    expect(result).toBeNull()
    expect(remove).not.toHaveBeenCalled()
  })

  it('removes member and returns it', async () => {
    const findMembership = jest.fn().mockResolvedValue(member)
    const remove = jest.fn().mockResolvedValue(member)
    const repo = { findMembership, remove } as unknown as ProjectMemberRepository

    const handler = new RemoveMemberHandler(repo)
    const result = await handler.execute(new RemoveMemberCommand('1', '2'))
    expect(remove).toHaveBeenCalledWith(member)
    expect(result).toBe(member)
  })
})
