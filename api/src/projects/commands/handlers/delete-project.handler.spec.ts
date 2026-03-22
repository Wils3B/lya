import { Project } from '../../entities/project.entity'
import { ProjectLocaleRepository } from '../../repositories/project-locale.repository'
import { ProjectMemberRepository } from '../../repositories/project-member.repository'
import { ProjectRepository } from '../../repositories/project.repository'
import { DeleteProjectCommand } from '../delete-project.command'
import { DeleteProjectHandler } from './delete-project.handler'

describe('DeleteProjectHandler', () => {
  const project = { id: 1 } as Project

  function makeRepos(projectFound = true) {
    const findById = jest.fn().mockResolvedValue(projectFound ? project : null)
    const remove = jest.fn().mockResolvedValue(project)
    const projectRepo = { findById, remove } as unknown as ProjectRepository

    const deleteLocales = jest.fn().mockResolvedValue(undefined)
    const localeRepo = { deleteByProjectId: deleteLocales } as unknown as ProjectLocaleRepository

    const deleteMembers = jest.fn().mockResolvedValue(undefined)
    const memberRepo = { deleteByProjectId: deleteMembers } as unknown as ProjectMemberRepository

    return { projectRepo, localeRepo, memberRepo, findById, remove, deleteLocales, deleteMembers }
  }

  it('returns null when project does not exist', async () => {
    const { projectRepo, localeRepo, memberRepo } = makeRepos(false)
    const handler = new DeleteProjectHandler(projectRepo, localeRepo, memberRepo)
    const result = await handler.execute(new DeleteProjectCommand('1', '10'))
    expect(result).toBeNull()
  })

  it('cascades deletion of locales and members then removes project', async () => {
    const { projectRepo, localeRepo, memberRepo, remove, deleteLocales, deleteMembers } = makeRepos()
    const handler = new DeleteProjectHandler(projectRepo, localeRepo, memberRepo)
    const result = await handler.execute(new DeleteProjectCommand('1', '10'))

    expect(deleteLocales).toHaveBeenCalledWith('1')
    expect(deleteMembers).toHaveBeenCalledWith('1')
    expect(remove).toHaveBeenCalledWith(project)
    expect(result).toBe(project)
  })
})
