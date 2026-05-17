import { ConflictException } from '@nestjs/common'
import { ProjectRole } from '../../entities/project-role.enum'
import { Project } from '../../entities/project.entity'
import { ProjectMemberRepository } from '../../repositories/project-member.repository'
import { ProjectRepository } from '../../repositories/project.repository'
import { CreateProjectCommand } from '../create-project.command'
import { CreateProjectHandler } from './create-project.handler'

describe('CreateProjectHandler', () => {
  const savedProject = { id: 1, name: 'My App', slug: 'my-app', description: null } as Project

  function makeRepos(overrides: Partial<{ findBySlug: jest.Mock }> = {}) {
    const findBySlug = overrides.findBySlug ?? jest.fn().mockResolvedValue(null)
    const createProject = jest.fn().mockReturnValue(savedProject)
    const orgSave = jest.fn().mockResolvedValue(savedProject)
    const projectRepo = {
      findBySlug,
      createProject,
      save: orgSave,
    } as unknown as ProjectRepository

    const createMembership = jest.fn().mockReturnValue({})
    const memberSave = jest.fn().mockResolvedValue({})
    const memberRepo = {
      createMembership,
      save: memberSave,
    } as unknown as ProjectMemberRepository

    return { projectRepo, memberRepo, findBySlug, createProject, orgSave, createMembership, memberSave }
  }

  it('creates a project and auto-adds creator as maintainer', async () => {
    const { projectRepo, memberRepo, createProject, orgSave, createMembership, memberSave } = makeRepos()
    const handler = new CreateProjectHandler(projectRepo, memberRepo)

    const result = await handler.execute(new CreateProjectCommand('10', { name: 'My App', slug: 'my-app' }, '42'))

    expect(createProject).toHaveBeenCalledWith('10', 'My App', 'my-app', null)
    expect(orgSave).toHaveBeenCalled()
    expect(createMembership).toHaveBeenCalledWith('1', '42', ProjectRole.MAINTAINER)
    expect(memberSave).toHaveBeenCalled()
    expect(result).toBe(savedProject)
  })

  it('throws ConflictException if slug already exists in org', async () => {
    const { projectRepo, memberRepo } = makeRepos({
      findBySlug: jest.fn().mockResolvedValue(savedProject),
    })
    const handler = new CreateProjectHandler(projectRepo, memberRepo)

    await expect(
      handler.execute(new CreateProjectCommand('10', { name: 'My App', slug: 'my-app' }, '42'))
    ).rejects.toThrow(ConflictException)
  })

  it('passes description to createProject', async () => {
    const { projectRepo, memberRepo, createProject } = makeRepos()
    const handler = new CreateProjectHandler(projectRepo, memberRepo)

    await handler.execute(
      new CreateProjectCommand('10', { name: 'My App', slug: 'my-app', description: 'A cool app' }, '42')
    )

    expect(createProject).toHaveBeenCalledWith('10', 'My App', 'my-app', 'A cool app')
  })
})
