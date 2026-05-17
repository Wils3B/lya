import { ConflictException } from '@nestjs/common'
import { ProjectMember } from '../../entities/project-member.entity'
import { ProjectRole } from '../../entities/project-role.enum'
import { ProjectMemberRepository } from '../../repositories/project-member.repository'
import { AddMemberCommand } from '../add-member.command'
import { AddMemberHandler } from './add-member.handler'

describe('AddMemberHandler', () => {
  const member = { id: 1, projectId: 1, userId: 2, role: ProjectRole.CONTRIBUTOR } as ProjectMember

  function makeRepo(existing: ProjectMember | null = null) {
    const createMembership = jest.fn().mockReturnValue(member)
    const save = jest.fn().mockResolvedValue(member)
    const repo = {
      findMembership: jest.fn().mockResolvedValue(existing),
      createMembership,
      save,
    } as unknown as ProjectMemberRepository
    return { repo, createMembership, save }
  }

  it('adds member to project', async () => {
    const { repo, createMembership, save } = makeRepo()
    const handler = new AddMemberHandler(repo)
    const result = await handler.execute(new AddMemberCommand('1', '2', ProjectRole.CONTRIBUTOR))

    expect(createMembership).toHaveBeenCalledWith('1', '2', ProjectRole.CONTRIBUTOR)
    expect(save).toHaveBeenCalled()
    expect(result).toBe(member)
  })

  it('throws ConflictException when user is already a member', async () => {
    const { repo } = makeRepo(member)
    const handler = new AddMemberHandler(repo)
    await expect(handler.execute(new AddMemberCommand('1', '2', ProjectRole.CONTRIBUTOR))).rejects.toThrow(
      ConflictException
    )
  })
})
