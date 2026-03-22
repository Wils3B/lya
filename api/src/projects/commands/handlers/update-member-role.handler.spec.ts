import { ProjectMember } from '../../entities/project-member.entity'
import { ProjectRole } from '../../entities/project-role.enum'
import { ProjectMemberRepository } from '../../repositories/project-member.repository'
import { UpdateMemberRoleCommand } from '../update-member-role.command'
import { UpdateMemberRoleHandler } from './update-member-role.handler'

describe('UpdateMemberRoleHandler', () => {
  const member = { id: 1, role: ProjectRole.CONTRIBUTOR } as ProjectMember

  it('returns null when member not found', async () => {
    const findMembership = jest.fn().mockResolvedValue(null)
    const save = jest.fn()
    const repo = { findMembership, save } as unknown as ProjectMemberRepository

    const handler = new UpdateMemberRoleHandler(repo)
    const result = await handler.execute(new UpdateMemberRoleCommand('1', '2', ProjectRole.MAINTAINER))
    expect(result).toBeNull()
  })

  it('updates role and saves', async () => {
    const findMembership = jest.fn().mockResolvedValue(member)
    const save = jest.fn().mockImplementation((m) => Promise.resolve(m))
    const repo = { findMembership, save } as unknown as ProjectMemberRepository

    const handler = new UpdateMemberRoleHandler(repo)
    const result = await handler.execute(new UpdateMemberRoleCommand('1', '2', ProjectRole.MAINTAINER))
    expect(result?.role).toBe(ProjectRole.MAINTAINER)
    expect(save).toHaveBeenCalled()
  })
})
